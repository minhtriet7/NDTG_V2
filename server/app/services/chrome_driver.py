import random
import os
from typing import List, Optional

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


class ChromeDriver:
    """
    ChromeDriver dùng cho Agent 3 Google Lens.

    Hỗ trợ proxy.data dạng:
      1.2.3.4:8000
      HTTP|1.2.3.4:8000
      http://1.2.3.4:8000
      https://1.2.3.4:8000
      socks5://1.2.3.4:1080

    Lưu ý:
    - Nếu proxy có username/password dạng:
        http://user:pass@host:port
      Chrome có thể không auth ổn chỉ bằng --proxy-server.
      Nên dùng proxy whitelist IP hoặc selenium-wire nếu cần proxy auth.
    """

    def __init__(self):
        # Tự động tìm file proxy.data ở thư mục gốc project
        self.proxy_file_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "proxy.data"
        )
        self.proxies = self._load_proxies()

    def _load_proxies(self) -> List[str]:
        """
        Đọc file proxy.data.
        Chấp nhận:
          HTTP|ip:port
          ip:port
          http://ip:port
          socks5://ip:port
        """
        loaded_proxies = []

        if not os.path.exists(self.proxy_file_path):
            print(f"⚠️ KHÔNG TÌM THẤY file {self.proxy_file_path}. Sẽ chạy bằng IP gốc của máy!")
            return loaded_proxies

        with open(self.proxy_file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()

                if not line:
                    continue

                # Bỏ comment trong proxy.data
                if line.startswith("#"):
                    continue

                proxy = self._normalize_proxy(line)

                if proxy:
                    loaded_proxies.append(proxy)

        print(f"✅ Đã nạp thành công {len(loaded_proxies)} proxy từ proxy.data")
        return loaded_proxies

    def _normalize_proxy(self, proxy_line: str) -> Optional[str]:
        """
        Chuẩn hóa proxy để đưa vào:
          --proxy-server=<proxy>

        Input có thể là:
          HTTP|1.2.3.4:8000
          1.2.3.4:8000
          http://1.2.3.4:8000
          socks5://1.2.3.4:1080
        """
        proxy = proxy_line.strip()

        if not proxy:
            return None

        # Nếu dạng HTTP|ip:port thì lấy phần sau dấu |
        if "|" in proxy:
            proxy = proxy.split("|", 1)[1].strip()

        if not proxy:
            return None

        # Nếu đã có scheme thì giữ nguyên
        if proxy.startswith(("http://", "https://", "socks5://", "socks4://")):
            return proxy

        # Mặc định coi là HTTP proxy
        return f"http://{proxy}"

    def _pick_proxy(self) -> Optional[str]:
        if not self.proxies:
            return None

        return random.choice(self.proxies)

    def get_driver(self):
        chrome_options = Options()

        # Chạy headless trên server
        chrome_options.add_argument("--headless=new")

        # Tối ưu môi trường server / Docker
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")

        # Giảm log và bớt dấu hiệu automation cơ bản
        chrome_options.add_experimental_option(
            "excludeSwitches",
            ["enable-logging", "enable-automation"]
        )
        chrome_options.add_experimental_option("useAutomationExtension", False)
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")

        # Tắt một số thứ không cần thiết để nhẹ hơn
        chrome_options.add_argument("--disable-notifications")
        chrome_options.add_argument("--disable-popup-blocking")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-background-networking")
        chrome_options.add_argument("--disable-sync")
        chrome_options.add_argument("--metrics-recording-only")
        chrome_options.add_argument("--mute-audio")

        # Fake user-agent
        chrome_options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )

        # Proxy
        selected_proxy = self._pick_proxy()

        if selected_proxy:
            print(f"🔄 [Agent 3] Đang dùng Proxy: {selected_proxy}")
            chrome_options.add_argument(f"--proxy-server={selected_proxy}")
        else:
            print("ℹ️ [Agent 3] Không dùng proxy, chạy bằng IP gốc.")

        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)

        # Timeout để Lens không treo quá lâu
        driver.set_page_load_timeout(30)
        driver.set_script_timeout(30)

        # Xóa cờ navigator.webdriver
        try:
            driver.execute_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            )
        except Exception:
            pass

        return driver