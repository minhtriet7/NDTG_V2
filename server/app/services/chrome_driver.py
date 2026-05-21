import random
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

class ChromeDriver:
    def __init__(self):
        # Tự động tìm file proxy.data ở thư mục gốc (ngang hàng với main.py)
        self.proxy_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "proxy.data")
        self.proxies = self._load_proxies()

    def _load_proxies(self) -> list:
        """Đọc file proxy.data và tách lấy IP:PORT"""
        loaded_proxies = []
        if os.path.exists(self.proxy_file_path):
            with open(self.proxy_file_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        # File của bác có dạng HTTP|103.22.11.22:8080 -> Cắt lấy phần sau dấu |
                        parts = line.split("|")
                        if len(parts) == 2:
                            loaded_proxies.append(parts[1].strip())
                        else:
                            loaded_proxies.append(line.strip()) # Đề phòng định dạng chỉ có IP:PORT
            print(f"✅ Đã nạp thành công {len(loaded_proxies)} proxy từ proxy.data")
        else:
            print(f"⚠️ KHÔNG TÌM THẤY file {self.proxy_file_path}. Sẽ chạy bằng IP gốc của máy!")
        return loaded_proxies

    def get_driver(self):
        chrome_options = Options()
        
        # --- CẤU HÌNH ẨN DANH & TỐI ƯU MÔI TRƯỜNG SERVER ---
       # chrome_options.add_argument("--headless=new") # Chạy ngầm không mở giao diện
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_experimental_option('excludeSwitches', ['enable-logging', 'enable-automation'])
        chrome_options.add_experimental_option('useAutomationExtension', False)

        # --- LOGIC XOAY VÒNG PROXY ---
        if self.proxies:
            selected_proxy = random.choice(self.proxies)
            print(f"🔄 [Agent 3] Đang cào dữ liệu qua Proxy: {selected_proxy}")
            # Cấu hình proxy cho HTTP/HTTPS
            chrome_options.add_argument(f'--proxy-server=http://{selected_proxy}')

        # --- FAKE USER-AGENT ---
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")

        # Khởi tạo driver (Tự tải đúng bản Chrome hiện tại của máy)
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Xóa cờ navigator.webdriver (ẩn thân tối đa)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        return driver