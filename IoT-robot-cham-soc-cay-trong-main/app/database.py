# Cấu hình SQLAlchemy trong FastAPI để kết nối và làm việc với cơ sở dữ liệu PostgreSQL
## SQLALCHEMY_DATABASE_URL = '<database_type>://username:password@host/<database_name>'

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:truong123@localhost/fastapi'
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()