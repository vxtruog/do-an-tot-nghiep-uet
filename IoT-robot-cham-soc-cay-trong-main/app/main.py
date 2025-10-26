from jinja2template import templates
from fastapi import FastAPI, Request, status, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import psycopg2
from psycopg2.extras import RealDictCursor
from sqlalchemy.orm import Session
from time import sleep

import users
from models import UserModel
from database import Base, engine, get_db
from utils import hash
from jwt import verify_access_token
from firebase import upload_user_to_firebase


Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

# Kiểm tra kết nối với PostgreSQL
while True:
    try:
        conn = psycopg2.connect(host='localhost', database='fastapi', user='postgres', password='truong123', cursor_factory=RealDictCursor)
        cursor = conn.cursor()
        print("Database connection was successfull !")
        break
    except Exception as error:
        print("Connection to database failed !")
        print("Error: ", error)
        sleep(2)

# Tạo trước một tài khoản admin ban đầu nếu chưa có
@app.on_event("startup")
def create_admin():
    db: Session = next(get_db())
    admin = db.query(UserModel).filter(UserModel.username == "admin").first()
    if not admin:
        admin = UserModel(
            fullname="Vũ Xuân Trường",
            position="Quản trị viên",
            username="admin",
            password=hash("123"),
            role="admin"
        )
        db.add(admin)
        db.commit()
    upload_user_to_firebase(admin)
    db.close()


@app.get("/")
def home(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse("/users/login", status_code=status.HTTP_302_FOUND)
    try:
        token_data = verify_access_token(token, credentials_exception=HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"))
        current_username = token_data.username
        current_role = token_data.role
        users = db.query(UserModel).all()
        return templates.TemplateResponse("index.html", {
            "request": request,
            "username": current_username,
            "role": current_role,
            "users": users})
    except HTTPException:
        return RedirectResponse("/users/login", status_code=status.HTTP_302_FOUND)

app.include_router(users.router)
