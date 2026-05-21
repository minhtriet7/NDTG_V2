from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
import asyncio
import json

from app.core.dependencies import get_current_user
from app.models.user_model import User

try:
    from app.utils.image_processing import detect_and_crop_banknotes
except ModuleNotFoundError:
    from app.utils.image_checker import detect_and_crop_banknotes

from app.agents.agent_1_ml import run_agent1_yolo
from app.agents.agent_2_llm import run_agent2_llm
from app.agents.agent_3_lens import run_agent3_lens
from app.agents.agent_aggregator import run_aggregator

router = APIRouter()


def parse_agent_json(raw_value, fallback_message: str):
    try:
        parsed = json.loads(raw_value)
        if isinstance(parsed, list):
            return parsed[0] if parsed else {}
        if isinstance(parsed, dict):
            return parsed
        return {"error": fallback_message, "raw": str(raw_value)}
    except Exception:
        return {"error": fallback_message, "raw": str(raw_value)}


def get_agent_value(agent_data: dict, key_primary: str, key_fallback: str = None, default="N/A"):
    if not isinstance(agent_data, dict):
        return default
    return agent_data.get(key_primary) or (agent_data.get(key_fallback) if key_fallback else None) or default


def derive_currency(denomination: str) -> str:
    if not denomination or denomination in {"Needs review", "N/A"}:
        return "N/A"

    parts = str(denomination).strip().split()
    if len(parts) >= 2:
        return parts[-1].upper()

    return "VND"


def build_debate_log(object_index: int, rounds: list, final_consensus: dict) -> str:
    debate_log = f"## Multi-Agent Debate Log (Banknote Object {object_index})\n\n"

    for round_data in rounds:
        debate_log += f"### Round {round_data['round']}\n\n"

        a1 = round_data["agent1"]
        a2 = round_data["agent2"]
        a3 = round_data["agent3"]
        decision = round_data["decision"]

        debate_log += (
            f"**Agent 1 (YOLO):** Đề xuất: "
            f"`{get_agent_value(a1, 'menh_gia')} - {get_agent_value(a1, 'quoc_gia')}`\n"
            f"> Lập luận: {get_agent_value(a1, 'quan_diem', default='Không có')}\n\n"
        )

        debate_log += (
            f"**Agent 2 (LLM):** Đề xuất: "
            f"`{get_agent_value(a2, 'menh_gia')} - {get_agent_value(a2, 'quoc_gia')}`\n"
            f"> Lập luận: {get_agent_value(a2, 'quan_diem', default='Không có')}\n\n"
        )

        debate_log += (
            f"**Agent 3 (Lens):** Đề xuất: "
            f"`{get_agent_value(a3, 'menh_gia')} - {get_agent_value(a3, 'quoc_gia')}`\n"
            f"> Lập luận: {get_agent_value(a3, 'quan_diem', default='Không có')}\n\n"
        )

        debate_log += (
            "**Aggregator Decision:**\n"
            f"> {decision.get('quan_diem_trong_tai', 'Đã xử lý.')}\n\n"
            "---\n\n"
        )

    if final_consensus.get("status") == "Completed":
        debate_log += "CONSENSUS REACHED. Chốt kết quả cuối cùng.\n"
    elif final_consensus.get("status") == "Failed":
        debate_log += "FAILED. Không có Agent nào trả về kết quả hợp lệ.\n"
    else:
        debate_log += "CONFLICT DETECTED. Cần kiểm tra thủ công hoặc quét lại.\n"

    return debate_log


@router.post("/scan")
async def scan_banknote(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if current_user.token_balance <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản đã hết số dư Token.",
        )

    raw_bytes = await file.read()

    if len(raw_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Dung lượng ảnh vượt quá giới hạn 5MB.")

    # Trừ 1 token cho 1 request scan.
    current_user.token_balance -= 1
    await current_user.save()

    try:
        cropped_images = detect_and_crop_banknotes(raw_bytes)
        if not cropped_images:
            cropped_images = [raw_bytes]
    except Exception as crop_error:
        print(f"[Recognition] Crop failed, using original image: {crop_error}")
        cropped_images = [raw_bytes]

    final_response_list = []

    from app.models.recognition_model import RecognitionRequest
    from app.utils.cloudinary_handler import upload_image_to_cloudinary

    for idx, img_bytes in enumerate(cropped_images):
        context_for_llm = ""
        max_retries = 1
        final_consensus = None
        last_agent1_data = {}
        last_agent2_data = {}
        last_agent3_data = {}
        round_logs = []

        for attempt in range(max_retries + 1):
            results = await asyncio.gather(
                run_agent1_yolo(img_bytes),
                run_agent2_llm(img_bytes, context_for_llm),
                run_agent3_lens(img_bytes),
                return_exceptions=True,
            )

            res_1 = results[0] if not isinstance(results[0], Exception) else '[{"status":"Failed","menh_gia":"Lỗi","quoc_gia":"Lỗi","quan_diem":"YOLO thất bại","phuong_phap":"YOLO"}]'
            res_2 = results[1] if not isinstance(results[1], Exception) else '[{"status":"Failed","menh_gia":"Lỗi","quoc_gia":"Lỗi","quan_diem":"LLM thất bại","phuong_phap":"LLM"}]'
            res_3 = results[2] if not isinstance(results[2], Exception) else '[{"status":"Failed","menh_gia":"Lỗi","quoc_gia":"Lỗi","quan_diem":"Lens thất bại","phuong_phap":"Lens"}]'

            agent1_data = parse_agent_json(res_1, "Lỗi cấu trúc dữ liệu Agent 1")
            agent2_data = parse_agent_json(res_2, "Lỗi cấu trúc dữ liệu Agent 2")
            agent3_data = parse_agent_json(res_3, "Lỗi cấu trúc dữ liệu Agent 3")

            final_consensus = await run_aggregator(res_1, res_2, res_3)

            round_logs.append({
                "round": attempt + 1,
                "agent1": agent1_data,
                "agent2": agent2_data,
                "agent3": agent3_data,
                "decision": final_consensus,
            })

            last_agent1_data = agent1_data
            last_agent2_data = agent2_data
            last_agent3_data = agent3_data

            if final_consensus.get("require_rerun") and attempt < max_retries:
                context_for_llm = (
                    f"YOLO đề xuất: {res_1}. "
                    f"Lens đề xuất: {res_3}. "
                    "Hai Agent đang mâu thuẫn hoặc thiếu dữ liệu. Hãy phân tích lại thật kỹ dựa trên chữ/mệnh giá hiển thị trên tờ tiền."
                )
                await asyncio.sleep(1)
                continue

            break

        if final_consensus is None:
            final_consensus = {
                "require_rerun": True,
                "method": "majority_vote",
                "status": "Failed",
                "matched_agents": 0,
                "so_luong_dong_thuan": 0,
                "final_denomination": None,
                "quan_diem_trong_tai": "Hệ thống không tạo được quyết định tổng hợp.",
            }

        debate_log = build_debate_log(idx + 1, round_logs, final_consensus)
        final_consensus["debate_log"] = debate_log

        consensus_status = final_consensus.get("status", "Conflict")
        matched_agents = int(
            final_consensus.get("matched_agents")
            or final_consensus.get("so_luong_dong_thuan")
            or 0
        )

        if consensus_status == "Completed":
            final_denomination = final_consensus.get("final_denomination") or final_consensus.get("menh_gia")
            final_agent_key = final_consensus.get("final_agent")
            source_map = {
                "ml_dl": last_agent1_data,
                "llm_api": last_agent2_data,
                "visual_search": last_agent3_data,
            }
            source_data = source_map.get(final_agent_key) or final_consensus

            final_country = (
                source_data.get("quoc_gia")
                or source_data.get("country")
                or final_consensus.get("quoc_gia")
                or "Không xác định"
            )
            final_material = (
                source_data.get("chat_lieu")
                or source_data.get("material")
                or final_consensus.get("chat_lieu")
                or "Không xác định"
            )
            final_description = (
                source_data.get("mo_ta")
                or source_data.get("description")
                or ""
            )

        else:
            final_denomination = "Needs review"
            final_country = "Không xác định"
            final_material = "Không xác định"
            final_description = (
                "Các Agent chưa đạt đồng thuận đủ tin cậy. "
                "Cần quét lại hoặc kiểm tra thủ công."
            )

        image_url = await upload_image_to_cloudinary(img_bytes)

        record_status = "Completed" if consensus_status == "Completed" else (
            "Failed" if consensus_status == "Failed" else "Needs Review"
        )

        record = RecognitionRequest(
            user_id=str(current_user.id),
            uploaded_image_url=image_url or "https://via.placeholder.com/400",
            status=record_status,
            final_result=final_consensus,
            agent_results=[
                {"agent": "YOLO", "data": last_agent1_data},
                {"agent": "LLM", "data": last_agent2_data},
                {"agent": "Lens", "data": last_agent3_data},
            ],
        )
        await record.insert()

        final_response_list.append({
            "id": str(record.id),
            "image_url": image_url,
            "data": {
                "denomination": final_denomination,
                "currency": derive_currency(final_denomination),
                "country": final_country,
                "origin": final_country,
                "description": final_description,
                "material": final_material,
                "estimated_usd": "N/A",
            },
            "agents": {
                "ml_dl": last_agent1_data,
                "llm_api": last_agent2_data,
                "visual_search": last_agent3_data,
            },
            "consensus": {
                "method": final_consensus.get("method", "majority_vote"),
                "matched_agents": matched_agents,
                "status": consensus_status,
                "referee_view": final_consensus.get("quan_diem_trong_tai")
                or final_consensus.get("referee_view")
                or "Hệ thống chưa có kết luận.",
                "valid_votes": final_consensus.get("valid_votes", []),
                "debate_log": debate_log,
            },
        })

    return final_response_list


@router.get("/{record_id}")
async def get_scan_detail(record_id: str, current_user: User = Depends(get_current_user)):
    from app.controllers.recognition_controller import RecognitionController

    return await RecognitionController.get_result_detail(current_user, record_id)
