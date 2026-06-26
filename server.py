"""
server.py — DTJ Portfolio 全栈服务器
======================================
纯 Python 标准库实现，不依赖任何第三方包。
一个文件 = 网站服务器 + API 服务器，本地和 Render 云端都能跑。

启动（本地）：python server.py
启动（Render）：自动运行，PORT 从环境变量读取

功能：
  1. 静态网站服务 —— 返回 index.html / admin.html / CSS / JS / 图片 / 视频 / 音乐
  2. 留言板 API —— RESTful 接口，JSON 文件存储

API 路由：
  POST   /api/messages                   — 发留言（访客）
  GET    /api/messages?user_id=xxx       — 看自己的留言（访客）
  GET    /api/messages?admin_token=xxx   — 看全部留言（管理员）
  DELETE /api/messages/<id>?admin_token=xxx — 删留言（管理员）
  POST   /api/auth                       — 管理员登录
"""

import json
import os
import sys
import time
import uuid
import hashlib
import secrets
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# ============================================================
# 配置 —— 改这里就行
# ============================================================
PORT = int(os.environ.get("PORT", 8080))  # 从环境变量读取（Render 会用），默认 8080
DEFAULT_ADMIN_PASSWORD = "admin123" # 默认管理员密码（第一次启动生效）
TOKEN_EXPIRE_SECONDS = 86400        # 管理员 token 有效期（24小时 = 86400秒）
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")

# ============================================================
# 数据读写（线程安全）
# ============================================================
data_lock = threading.Lock()        # 读写锁，防止并发写坏 JSON文件

def load_data():
    """读取 data.json，如果文件不存在就创建一个空的"""
    if not os.path.exists(DATA_FILE):
        default = {
            "admin_password_hash": hashlib.sha256(
                DEFAULT_ADMIN_PASSWORD.encode("utf-8")
            ).hexdigest(),
            "messages": []
        }
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(default, f, ensure_ascii=False, indent=2)
        return default
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"[server] data.json 读取失败: {e}，返回空数据")
        return {"admin_password_hash": "", "messages": []}

def save_data(data):
    """把数据写回 data.json"""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ============================================================
# 管理员 token 管理（存在内存里，重启服务器就清空）
# ============================================================
admin_tokens = {}  # {token字符串: 过期时间戳}

def create_admin_token():
    """生成一个新的管理员 token，记录过期时间"""
    token = secrets.token_hex(16)  # 32个字符的随机 hex字符串
    admin_tokens[token] = time.time() + TOKEN_EXPIRE_SECONDS
    return token

def is_valid_admin_token(token):
    """检查管理员 token 是否有效且未过期"""
    if not token or token not in admin_tokens:
        return False
    if time.time() > admin_tokens[token]:
        del admin_tokens[token]  # 过期了，删掉
        return False
    return True

# ============================================================
# 留言数据操作
# ============================================================
def get_messages_for_user(user_id, max_count=50):
    """获取某个访客的留言，按时间倒序，最多 max_count 条"""
    data = load_data()
    user_msgs = [m for m in data["messages"] if m["user_id"] == user_id]
    user_msgs.sort(key=lambda m: m["created_at"], reverse=True)
    return user_msgs[:max_count]

def get_all_messages():
    """获取全部留言，按时间倒序"""
    data = load_data()
    return sorted(data["messages"], key=lambda m: m["created_at"], reverse=True)

def create_message(user_id, name, text):
    """创建一条新留言，返回创建好的留言对象"""
    msg = {
        "id": str(uuid.uuid4()),
        "user_id": user_id.strip(),
        "name": name.strip(),
        "text": text.strip(),
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()) + "Z"
    }
    data = load_data()
    data["messages"].append(msg)
    save_data(data)
    return msg

def delete_message_by_id(msg_id):
    """删除指定 ID 的留言（没有这条留言也不报错，幂等操作）"""
    data = load_data()
    original_count = len(data["messages"])
    data["messages"] = [m for m in data["messages"] if m["id"] != msg_id]
    if len(data["messages"]) != original_count:
        save_data(data)
        return True
    return False  # 没找到这条留言

# ============================================================
# HTTP 请求处理器
# ============================================================
class GuestbookHandler(BaseHTTPRequestHandler):
    """处理所有 HTTP 请求"""

    def log_message(self, format, *args):
        """覆盖默认日志，用更简洁的格式"""
        print(f"[server] {args[0]}")

    # ---- 工具方法 ----

    def send_cors_headers(self):
        """给所有响应加 CORS 头，让 file:// 打开的页面也能请求"""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def send_json(self, status_code, data):
        """发送 JSON 响应"""
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_html(self, status_code, html):
        """发送 HTML 响应"""
        body = html.encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        """读取请求体里的 JSON"""
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def get_query_params(self):
        """解析 URL 里的查询参数（?user_id=xxx 这种）"""
        parsed = urlparse(self.path)
        return parse_qs(parsed.query)

    # ---- 路由分发 ----

    def do_OPTIONS(self):
        """CORS 预检请求 —— 直接返回允许跨域"""
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        """GET 请求路由"""
        path = urlparse(self.path).path

        # ---- API 路由 ----
        if path == "/api/messages":
            self.handle_get_messages()
            return

        # ---- 静态文件路由 ----
        if path == "/" or path == "":
            self.serve_static_file("/index.html")
        elif path == "/admin" or path == "/admin.html":
            self.serve_static_file("/admin.html")
        elif path.startswith("/css/") or path.startswith("/js/") or \
             path.startswith("/images/") or path.startswith("/music/") or \
             path.startswith("/fonts/"):
            self.serve_static_file(path)
        else:
            # 其他路径（可能是 /.gitignore 等），返回 404
            self.send_html(404, """<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>404 - DTJ</title>
<style>
  body { background:#1a1a2e; color:#fdfaf3; font-family:sans-serif;
         display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; }
  .card { text-align:center; padding:40px; }
  h1 { font-size:3rem; color:#d4a843; margin:0; }
  p { color:rgba(253,250,243,0.5); }
  a { color:#d4a843; }
</style></head>
<body>
<div class="card">
  <h1>404</h1>
  <p>页面没找到</p>
  <a href="/">← 回首页</a>
</div>
</body></html>""")

    def serve_static_file(self, path):
        """
        返回静态文件（HTML/CSS/JS/图片/视频/音频）
        安全防护：过滤掉 .. 路径穿越攻击
        """
        # 安全检查：路径里不能有 .. ，防止读取服务器上的任意文件
        if ".." in path:
            self.send_html(403, "<h1>403 Forbidden</h1>")
            return

        # 去掉开头的 /
        file_path = path.lstrip("/")

        # 映射到项目目录
        abs_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), file_path)

        # 确保文件在项目目录内（二次防护）
        project_dir = os.path.dirname(os.path.abspath(__file__))
        if not os.path.realpath(abs_path).startswith(os.path.realpath(project_dir)):
            self.send_html(403, "<h1>403 Forbidden</h1>")
            return

        # 文件不存在
        if not os.path.isfile(abs_path):
            self.send_html(404, """<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>404 - DTJ</title>
<style>
  body { background:#1a1a2e; color:#fdfaf3; font-family:sans-serif;
         display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; }
  h1 { font-size:3rem; color:#d4a843; margin:0; }
  p { color:rgba(253,250,243,0.5); }
  a { color:#d4a843; }
</style></head>
<body><div class="card"><h1>404</h1><p>文件没找到</p><a href="/">← 回首页</a></div></body></html>""")
            return

        # 根据文件后缀设置 Content-Type
        content_type = self.get_content_type(abs_path)

        try:
            with open(abs_path, "rb") as f:
                body = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_cors_headers()
            # 缓存：静态文件缓存 1 小时（节约流量）
            self.send_header("Cache-Control", "public, max-age=3600")
            self.end_headers()
            self.wfile.write(body)
        except IOError as e:
            self.send_html(500, f"<h1>500</h1><p>文件读取失败: {e}</p>")

    def get_content_type(self, filepath):
        """根据文件后缀返回正确的 Content-Type"""
        ext = os.path.splitext(filepath)[1].lower()
        types = {
            ".html": "text/html; charset=utf-8",
            ".css":  "text/css; charset=utf-8",
            ".js":   "application/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".jpg":  "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png":  "image/png",
            ".gif":  "image/gif",
            ".svg":  "image/svg+xml",
            ".ico":  "image/x-icon",
            ".mp4":  "video/mp4",
            ".webm": "video/webm",
            ".mp3":  "audio/mpeg",
            ".wav":  "audio/wav",
            ".woff": "font/woff",
            ".woff2":"font/woff2",
        }
        return types.get(ext, "application/octet-stream")

    def do_POST(self):
        """POST 请求路由"""
        path = urlparse(self.path).path

        if path == "/api/messages":
            self.handle_post_message()
        elif path == "/api/auth":
            self.handle_auth()
        else:
            self.send_json(404, {"ok": False, "error": "not found"})

    def do_DELETE(self):
        """DELETE 请求路由"""
        path = urlparse(self.path).path

        # 路径格式: /api/messages/<消息ID>
        if path.startswith("/api/messages/") and len(path) > len("/api/messages/"):
            msg_id = path[len("/api/messages/"):]
            self.handle_delete_message(msg_id)
        else:
            self.send_json(404, {"ok": False, "error": "not found"})

    # ---- 具体业务处理 ----

    def handle_get_messages(self):
        """GET /api/messages?user_id=xxx 或 ?admin_token=xxx"""
        params = self.get_query_params()

        # 管理员模式：传了 admin_token
        admin_token = params.get("admin_token", [None])[0]
        if admin_token:
            if not is_valid_admin_token(admin_token):
                self.send_json(401, {"ok": False, "error": "管理员登录已过期，请重新登录"})
                return
            self.send_json(200, {"ok": True, "messages": get_all_messages()})
            return

        # 访客模式：传了 user_id
        user_id = params.get("user_id", [None])[0]
        if not user_id:
            self.send_json(400, {"ok": False, "error": "缺少 user_id 参数"})
            return
        self.send_json(200, {"ok": True, "messages": get_messages_for_user(user_id)})

    def handle_post_message(self):
        """POST /api/messages —— 创建一条留言"""
        body = self.read_json_body()
        user_id = (body.get("user_id") or "").strip()
        name = (body.get("name") or "").strip()
        text = (body.get("text") or "").strip()

        # 参数校验
        if not user_id:
            self.send_json(400, {"ok": False, "error": "缺少 user_id"})
            return
        if not name or len(name) > 30:
            self.send_json(400, {"ok": False, "error": "名字不能为空且不超过30个字符"})
            return
        if not text or len(text) > 500:
            self.send_json(400, {"ok": False, "error": "留言不能为空且不超过500个字符"})
            return

        # 创建留言（加锁，保证线程安全）
        with data_lock:
            msg = create_message(user_id, name, text)

        self.send_json(201, {"ok": True, "message": msg})

    def handle_delete_message(self, msg_id):
        """DELETE /api/messages/<id>?admin_token=xxx —— 删除留言"""
        params = self.get_query_params()
        admin_token = params.get("admin_token", [None])[0]

        if not admin_token or not is_valid_admin_token(admin_token):
            self.send_json(401, {"ok": False, "error": "管理员登录已过期，请重新登录"})
            return

        with data_lock:
            deleted = delete_message_by_id(msg_id)

        self.send_json(200, {"ok": True, "deleted": msg_id})

    def handle_auth(self):
        """POST /api/auth —— 管理员登录"""
        body = self.read_json_body()
        password = (body.get("password") or "").strip()

        if not password:
            self.send_json(400, {"ok": False, "error": "请输入密码"})
            return

        data = load_data()
        stored_hash = data.get("admin_password_hash", "")
        input_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()

        if input_hash != stored_hash:
            self.send_json(401, {"ok": False, "error": "密码错误"})
            return

        token = create_admin_token()
        self.send_json(200, {"ok": True, "admin_token": token})

# ============================================================
# 启动服务器
# ============================================================
def main():
    # 修复 Windows 控制台 GBK 编码问题（Python 打印 emoji 会报错）
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

    print("=" * 55)
    print("  [DTJ] 旦增塔杰 Portfolio — 留言板 API 服务器")
    print("=" * 55)
    print(f"  监听地址: http://localhost:{PORT}")
    print(f"  数据文件: {DATA_FILE}")
    print(f"  默认管理员密码: {DEFAULT_ADMIN_PASSWORD}")
    print(f"  按 Ctrl+C 停止服务器")
    print("=" * 55)

    # 启动时检查/创建数据文件
    data = load_data()
    msg_count = len(data.get("messages", []))
    print(f"[server] 当前已有 {msg_count} 条留言")

    try:
        server = HTTPServer(("", PORT), GuestbookHandler)
        print(f"[server] 服务器已启动，等待请求...\n")
        server.serve_forever()
    except OSError as e:
        if e.errno == 10048 or "Address already in use" in str(e):
            print(f"\n[server] 端口 {PORT} 被占用！")
            print(f"[server] 请修改 server.py 顶部的 PORT 变量，换成其他端口（比如 8081）")
        else:
            print(f"\n[server] 启动失败: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n[server] 服务器已停止。下次再见~")
        sys.exit(0)

if __name__ == "__main__":
    main()
