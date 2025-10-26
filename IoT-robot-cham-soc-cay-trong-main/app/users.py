from jinja2template import templates
from fastapi import APIRouter, Request, status, HTTPException, Depends, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from database import get_db
from models import UserModel
from utils import hash, verify
from jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from firebase import upload_user_to_firebase, delete_user_from_firebase

router = APIRouter(
    prefix="/users",
    tags=['Users']
)

# Giao thức HTTP đến các trang
@router.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login")
def login(request: Request, db: Session = Depends(get_db), username: str = Form(), password: str = Form()):
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user and verify(password, user.password):
        # Tạo JWT token
        access_token = create_access_token(data={"username": user.username, "role": str(user.role)})
        response = RedirectResponse("/", status_code=status.HTTP_302_FOUND)
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax",    # hoặc "none" nếu dùng HTTPS
            secure=False       # True nếu dùng HTTPS
        )
        return response
    return templates.TemplateResponse("login.html", {
            "request": request,
            "error": "Thông tin đăng nhập chưa chính xác."
        })

@router.get("/logout")
def logout():
    response = RedirectResponse("/users/login", status_code=status.HTTP_302_FOUND)
    response.delete_cookie("access_token")
    return response

@router.get("/signup")
def signup(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

@router.post("/signup")
def signup_user(request: Request, db: Session=Depends(get_db), fullname: str = Form(), position: str = Form(), username: str = Form(), password: str = Form()):
    db_user = db.query(UserModel).filter(UserModel.username == username).first()
    if db_user:
        # Trùng tên -> hiển thị lại signup.html với thông báo lỗi
        return templates.TemplateResponse("signup.html", {
            "request": request,
            "error": "Tên đăng nhập đã tồn tại.",
            "username": username
        })
    signup = UserModel(fullname=fullname, position=position, username=username, password=hash(password))
    db.add(signup)
    db.commit()
    db.refresh(signup)

    upload_user_to_firebase(signup)

    return RedirectResponse(
        f"/?tab=quanlydangnhap&success=registered&username={username}",
        status_code=status.HTTP_302_FOUND
    )

@router.delete("/{id}")
def delete_post(id: int, db: Session = Depends(get_db)):
    post = db.query(UserModel).filter(UserModel.id == id)
    user = post.first()
    if user == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} does not exist")
    
    delete_user_from_firebase(user.username)

    post.delete(synchronize_session=False)
    db.commit()