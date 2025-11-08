# phần schemas (mô hình dữ liệu) để xác định cấu trúc vào/ra trong FastAPI với Pydantic.

from enum import Enum
from pydantic import BaseModel
from typing import Optional

#  Dữ liệu người dùng gửi khi đăng nhập
class UserLogin(BaseModel):
    username: str
    password: str
    class Config:
        from_attributes = True

# Vai trò của tài khoản người dùng
class Roles(Enum):
    admin = "admin"
    user = "user"

# Cấu trúc dữ liệu lấy ra từ JWT token sau khi giải mã.
class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Dữ liệu GPS nhận từ firebase
class GPSData(BaseModel):
    lat: float
    lng: float
    time: datetime | None = None