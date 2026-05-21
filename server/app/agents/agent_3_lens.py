import json
import requests
import time
import asyncio
import urllib.parse
from selenium.webdriver.common.by import By

from app.core.config import settings
from app.agents.agent_2_llm import (
    JSON_TEMPLATE,
    gemini_client,
    clean_json,
    MODEL_LLM_MAIN,
)
from app.agents.base_agent import BaseAgent
from app.services.chrome_driver import ChromeDriver


class Agent3Lens(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="Agent 3 (Google Lens)")

    def upload_to_imgbb(self, image_bytes: bytes):
        try:
            upload_url = "https://api.imgbb.com/1/upload"
            res = requests.post(
                upload_url,
                data={"key": settings.IMGBB_API_KEY},
                files={"image": image_bytes},
                timeout=30,
            )
            data = res.json()
            if "data" in data and "url" in data["data"]:
                return data["data"]["url"]

            print(f"[{self.agent_name}] Loi ImgBB Response: {data}")
            return None
        except Exception as e:
            print(f"[{self.agent_name}] Loi ImgBB Network: {e}")
            return None

    def scrape_google_lens_selenium(self, image_url: str) -> list:
        driver = None
        results = []

        try:
            print(f"[{self.agent_name}] Dang khoi tao Selenium (Dung Proxy & Anti-detect)...")

            driver_manager = ChromeDriver()
            driver = driver_manager.get_driver()

            encoded_url = urllib.parse.quote(image_url)
            direct_lens_url = f"https://lens.google.com/uploadbyurl?url={encoded_url}"

            print(f"[{self.agent_name}] Truy cap he thong phan tich Google Lens...")
            driver.get(direct_lens_url)

            print(f"[{self.agent_name}] Dang doi Lens render ket qua (5s)...")
            time.sleep(5)

            print(f"[{self.agent_name}] Dang trich xuat ket qua...")

            result_elements = driver.find_elements(
                By.CSS_SELECTOR,
                "div[role='listitem'], div.GNCY8c, div.VCOFK",
            )

            if result_elements:
                for el in result_elements:
                    try:
                        title_el = el.find_element(
                            By.CSS_SELECTOR,
                            "div[data-item-title='true'], .m76pS, .fXU79e",
                        )
                        title = title_el.text.strip()
                        link_el = el.find_element(By.TAG_NAME, "a")
                        href = link_el.get_attribute("href")

                        item = {"title": title, "url": href}
                        if href and title and item not in results:
                            results.append(item)

                        if len(results) >= 10:
                            break
                    except Exception:
                        continue

            if not results:
                links = driver.find_elements(By.TAG_NAME, "a")
                for link in links:
                    try:
                        href = link.get_attribute("href")
                        title = link.text.strip()

                        item = {"title": title, "url": href}
                        if (
                            href
                            and "google.com" not in href
                            and title
                            and len(title) > 5
                            and item not in results
                        ):
                            results.append(item)

                        if len(results) >= 10:
                            break
                    except Exception:
                        continue

            return results

        except Exception as e:
            print(f"[{self.agent_name}] Loi Scrape Selenium Lens: {str(e)}")
            return []

        finally:
            if driver:
                try:
                    driver.quit()
                except Exception:
                    pass

    def build_visual_search_result(
        self,
        raw_lens_text: str = None,
        formatted_result: dict = None,
        error: Exception = None,
    ) -> str:
        """
        If Lens raw text exists but LLM formatting fails, return Partial instead of Failed.
        """
        if formatted_result:
            formatted_result["status"] = formatted_result.get("status", "Completed")
            formatted_result["raw_text"] = raw_lens_text
            return json.dumps([formatted_result], ensure_ascii=False)

        if raw_lens_text:
            fallback_data = {
                "quoc_gia": "Không xác định",
                "menh_gia": "Không xác định",
                "mat_tien": "Không xác định",
                "nam_phat_hanh": "Không xác định",
                "chat_lieu": "Không xác định",
                "mo_ta": raw_lens_text[:500],
                "quan_diem": (
                    "Google Lens đã trả về dữ liệu thô, nhưng bước format bằng LLM gặp lỗi. "
                    "Hệ thống giữ raw_text để hỗ trợ đối chiếu thủ công."
                ),
                "phuong_phap": "Google Lens raw fallback",
                "status": "Partial",
                "raw_text": raw_lens_text,
            }
            return json.dumps([fallback_data], ensure_ascii=False)

        return self.get_error_response(f"Google Lens không lấy được dữ liệu hữu ích. {error or ''}")

    def parse_formatted_result(self, formatted_json_text: str, raw_lens_data: str) -> str:
        """
        clean_json may return a JSON string. Validate it and attach status/raw_text.
        """
        try:
            parsed = json.loads(formatted_json_text)
            item = parsed[0] if isinstance(parsed, list) and parsed else parsed

            if not isinstance(item, dict):
                return self.build_visual_search_result(raw_lens_text=raw_lens_data)

            item["status"] = item.get("status", "Completed")
            item["raw_text"] = raw_lens_data
            return json.dumps([item], ensure_ascii=False)

        except Exception as e:
            print(f"[{self.agent_name}] Loi parse formatted Lens result: {e}")
            return self.build_visual_search_result(raw_lens_text=raw_lens_data, error=e)

    async def run(self, image_bytes: bytes, context: str = "") -> str:
        if not settings.IMGBB_API_KEY:
            return self.get_error_response("Thiếu API Key ImgBB")

        try:
            image_url = self.upload_to_imgbb(image_bytes)
            if not image_url:
                return self.get_error_response("Lỗi Upload ImgBB. Không lấy được link ảnh.")

            results = await asyncio.to_thread(self.scrape_google_lens_selenium, image_url)

            if not results:
                return self.get_error_response("Selenium không tìm thấy thông tin hữu ích từ Google Lens.")

            raw_lens_data = " || ".join(
                [f"{r['title']} - {r['url']}" for r in results]
            )

            print(f"[{self.agent_name}] Da quet xong du lieu, dang gui cho LLM format lai...")

            prompt_format = f"""
Dưới đây là thông tin Google Lens quét được:
"{raw_lens_data}"

Dựa vào các tiêu đề và đường link này, hãy chắt lọc thông tin tờ tiền và xuất ĐÚNG CẤU TRÚC JSON.
Nếu không đủ dữ liệu để xác định mệnh giá, hãy ghi "Không xác định", không được tự đoán.
Mục "phuong_phap" bắt buộc ghi là "Google Lens (Selenium/Proxy)".

{JSON_TEMPLATE}
"""

            last_error = None

            for attempt in range(3):
                try:
                    res = gemini_client.models.generate_content(
                        model=MODEL_LLM_MAIN,
                        contents=[prompt_format],
                    )
                    print(f"[{self.agent_name}] Hoan tat format Lens!")
                    formatted_text = clean_json(res.text)
                    return self.parse_formatted_result(formatted_text, raw_lens_data)

                except Exception as e:
                    last_error = e
                    error_text = str(e)
                    print(f"[{self.agent_name}] Lens formatter failed attempt {attempt + 1}: {error_text}")

                    if "503" in error_text or "429" in error_text or "RESOURCE_EXHAUSTED" in error_text:
                        time.sleep(2)
                        continue

                    # Even for non-quota formatter errors, keep raw Lens data.
                    return self.build_visual_search_result(
                        raw_lens_text=raw_lens_data,
                        error=e,
                    )

            # Formatter failed after retries, but raw Lens data exists.
            return self.build_visual_search_result(
                raw_lens_text=raw_lens_data,
                error=last_error,
            )

        except Exception as e:
            return self.get_error_response(str(e))


async def run_agent3_lens(image_bytes: bytes, context: str = "") -> str:
    agent = Agent3Lens()
    return await agent.run(image_bytes, context)
