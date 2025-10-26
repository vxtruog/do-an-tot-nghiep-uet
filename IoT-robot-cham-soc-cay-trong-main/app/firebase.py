import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("robot-cham-soc-cay-trong.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://robot-cham-soc-cay-trong-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

def upload_user_to_firebase(user):
    ref = db.reference("users")  # node 'users' trong Firebase
    ref.child(user.username).set({
        "id": user.id,
        "fullname": user.fullname,
        "position": user.position,
        "username": user.username,
        "role": str(user.role),
        "created_at": str(user.created_at)
    })

def delete_user_from_firebase(username: str):
    ref = db.reference("users")
    user_ref = ref.child(username)
    if user_ref.get() is not None:
        user_ref.delete()
