import http.server
import socket
import socketserver
import webbrowser
import os
import sys

# Windows UTF-8 desteği
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class RobustHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def start():
    os.chdir(DIRECTORY)
    selected_port = PORT

    for p in range(PORT, PORT + 20):
        try:
            # SO_REUSEADDR ile port çakışmalarını önle
            socketserver.TCPServer.allow_reuse_address = True
            server = socketserver.TCPServer(("0.0.0.0", p), RobustHandler)
            selected_port = p
            break
        except OSError:
            continue
    else:
        print("[HATA] Uygun port bulunamadı.")
        return

    url1 = f"http://127.0.0.1:{selected_port}"
    url2 = f"http://localhost:{selected_port}"

    print("=" * 65)
    print("  NEUROFORGE YEREL SUNUCUSU HAZIR VE CALISIYOR!")
    print(f"  -> Tarayici Baglantisi (IP) : {url1}")
    print(f"  -> Tarayici Baglantisi (Ad) : {url2}")
    print("  Durdurmak icin bu pencerede Ctrl+C tuslayabilirsiniz.")
    print("=" * 65)
    sys.stdout.flush()

    # Tarayıcıda 127.0.0.1 doğrudan açılır (Windows localhost çözünürlük sorunlarına karşı en güvenli yoldur)
    try:
        webbrowser.open(url1)
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSunucu kapatildi.")
        server.server_close()

if __name__ == '__main__':
    start()
