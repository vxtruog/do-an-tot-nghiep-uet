# Render HTML template, tức là lấy một hoặc nhiều trang HTML, rồi nhúng biến trong Python vào, rồi trả lại trang HTML hoàn chỉnh
# Python trả về {"<biến>": "<giá trị>"} , dùng ở HTML với cú pháp { { <biến> } }

from starlette.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")