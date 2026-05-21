import json
import asyncio
from fastapi import HTTPException, status
from app.models.user_model import User
from app.models.recognition_model import RecognitionRequest
from server.app.utils.image_processing import detect_and_crop_banknotes
from app.utils.cloudinary_handler import upload_image_to_cloudinary

from app.agents.agent_1_ml import run_agent1_yolo
from app.agents.agent_2_llm import run_agent2_llm
from app.agents.agent_3_lens import run_agent3_lens
from app.agents.agent_aggregator import run_aggregator

class RecognitionService:
    @staticmethod
    async def process_banknote(user: User, image_bytes: bytes) -> RecognitionRequest:
        # 1. KIỂM TRA TOKEN (Tuyệt đối CHƯA TRỪ TOKEN ở đây)
        if user.token_balance < 1:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Tài khoản không đủ Token. Vui lòng nạp thêm."
            )

        # 2. TIỀN XỬ LÝ & CẮT ẢNH
        cropped_images = detect_and_crop_banknotes(image_bytes)
        best_image_bytes = cropped_images[0]
        
        # Upload ảnh thật lên Cloudinary để lưu lịch sử
        image_url = await upload_image_to_cloudinary(image_bytes)

        # 3. CHẠY VÒNG LẶP AI (CÓ TRANH BIỆN)
        context_for_llm = ""
        max_retries = 1
        final_consensus = None
        
        for attempt in range(max_retries + 1):
            try:
                res1, res2, res3 = await asyncio.gather(
                    run_agent1_yolo(best_image_bytes),
                    run_agent2_llm(best_image_bytes, context_for_llm),
                    run_agent3_lens(best_image_bytes),
                    return_exceptions=True
                )
                
                r1 = res1 if not isinstance(res1, Exception) else '[{"error": "YOLO failed"}]'
                r2 = res2 if not isinstance(res2, Exception) else '[{"error": "LLM failed"}]'
                r3 = res3 if not isinstance(res3, Exception) else '[{"error": "Lens failed"}]'
                
                final_consensus = await run_aggregator(r1, r2, r3)
                
                # Cắt nghĩa JSON an toàn
                def parse_safe(txt):
                    try: return json.loads(txt)[0]
                    except: return {"raw": txt}
                
                agent_results = [
                    {"agent": "YOLO", "result": parse_safe(r1)},
                    {"agent": "LLM", "result": parse_safe(r2)},
                    {"agent": "Lens", "result": parse_safe(r3)}
                ]

                # Nếu Trọng tài yêu cầu chạy lại (tranh biện)
                if final_consensus.get("require_rerun") and attempt < max_retries:
                    context_for_llm = f"Chú ý: YOLO báo {r1}, Lens báo {r3}. Hãy phân tích lại thật kỹ."
                    await asyncio.sleep(1)
                    continue 
                
                break # Thoát vòng lặp nếu thành công hoặc hết lượt
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Lỗi AI System: {str(e)}")

        # 4. LƯU LỊCH SỬ VÀO DATABASE
        record = RecognitionRequest(
            user_id=str(user.id),
            uploaded_image_url=image_url or "https://via.placeholder.com/400", 
            status="success" if not final_consensus.get("require_rerun") else "needs_review",
            final_result=final_consensus,
            agent_results=agent_results
        )
        await record.insert()

        # 5. BÂY GIỜ MỚI TRỪ TOKEN (An toàn tuyệt đối)
        user.token_balance -= 1
        await user.save()

        return record