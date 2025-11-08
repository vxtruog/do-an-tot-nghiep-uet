# định nghĩa ORM Model bằng SQLAlchemy để ánh xạ (mapping) sang bảng trong PostgreSQL

from sqlalchemy import Column, String, Integer, Enum
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP

from database import Base
from schemas import Roles

class UserModel(Base):
    __tablename__ = "users"
    id=Column(Integer, primary_key=True, index=True)
    fullname=Column(String, nullable=False, index=True)
    position=Column(String, nullable=False, index=True)
    username=Column(String, unique=True, index=True)
    password=Column(String, index=True)
    role=Column(Enum(Roles), default=Roles.user)
    created_at = Column(TIMESTAMP(timezone=False), nullable=False, server_default=text('now()'))