# 1. Tổng quan cách hoạt động của hệ thống giám sát robot chăm sóc cây trồng

    ┌───────────────────────────┐
    │  Webserver / Mobile Web   │
    │                           │
    └───────▲───────────────────┘
            │ 
            │ HTTP                               
            │                 
    ┌───────▼───────────────────┐                   ┌──────────────────────┐
    │   FastAPI + PostgreSQL    │   Firebase SDK    │ Firebase Realtime DB │
    │                           │<─────────────────>│                      │
    └───────▲───────────────────┘                   └──────────────────────┘
            │
    ┌───────▼───────────────────┐
    │     Laptop trạm           │
    │(MQTT Broker + MQTT Client)│
    └───────▲───────────────────┘
            │
            │ (LAN/Wifi)
            │ MQTT Pub + Sub
            │
    ┌───────▼───────────────────┐
    │   Robot (MQTT Client)     │
    │                           │
    └───────────────────────────┘

# 2. Database

- Database là tập hợp dữ liệu được tổ chức để có thể dễ dàng truy cập và quản lý
- Chúng ta không làm việc hoặc tương tác trực tiếp với Database. Thay vào đó, chúng ta có một hệ thống quản lý cơ sở dữ liệu trung gian là Database Management System (DBMS).
- SQL (Structured Query Language) là ngôn ngữ được sử dụng để giao tiếp với DBMS (chúng ta sử dụng PostgreSQL)
- Object Relational Mapper (ORM) là một lớp trừu tượng nằm giữa cơ sở dữ liệu và ứng dụng FastAPI, thay vì chúng ta vào tạo bảng ở PostgreSQL, chúng ta có thể định nghĩa bảng dưới dạng mô hình Python
- Sqlalchemy là một trong những ORM phổ biến nhất trong Python, nó là một thư viện độc lập, không liên quan đến FastAPI

# 3. Cài đặt môi trường

- Tải phần mềm Postman để theo dõi các phương thức của HTTP
- Tải phần mềm PostgreSQL để cấu hình Server
- Truy cập Firebase, tạo project, tải tệp .json về và đặt tên (ví dụ robot-cham-soc-cay-trong.json)
- Truy cập Firebase, tạo database, lấy đường dẫn để liên kết (ví dụ https://robot-cham-soc-cay-trong-default-rtdb.asia-southeast1.firebasedatabase.app/)

- pip install fastapi[all]
- pip install psycopg2
- pip install sqlalchemy
- pip install passlib[bcrypt]
- pip install python-jose[cryptography]
- pip install psycopg2 firebase-admin

- Vào thư mục app/, chạy lệnh sau để để mở cổng kết nối:
```
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload (chỉ truy cập trên máy nội bộ)
hoặc
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload (cho phép truy cập trên các thiết bị cùng mạng LAN)
```
- Truy cập trang web:
```
host: http://127.0.0.1:8000
client: http://192.168.x.x:8000
```
- Khi thay đổi project, có thể phải reset lại cache của trình duyệt để tránh lỗi, `Ctrl + Shift + Delete`

# 4. Một số phương thức của HTTP

- GET, lấy dữ liệu từ Server.
- POST, gửi dữ liệu lên Server để tạo mới.
- PUT, cập nhật toàn bộ trường dữ liệu.
- DELETE, xoá dữ liệu.

# 5. Một số lệnh SQL thao tác trong PostgreSQL

- SELECT \* FROM <table_name>; : truy xuất tất cả các cột trong table_name
- SELECT <col1>, <col2>, ... FROM <table_name>; : truy xuất một số cột được chỉ định trong table_name
- SELECT <col> AS <table*name>*<col> FROM <table_name>; : truy xuất tên cột mà có cùng tên trong nhiều table
- SELECT \* FROM <table_name> WHERE <condition>; : truy xuất cột có điều kiện tương ứng
- SELECT \* FROM <table_name> WHERE <col> LIKE '%<key>%'; : truy xuất hàng có chứa key trong cột
- SELECT \* FROM <table_name> ORDER BY <col> DESC/ASC; : sắp xếp các hàng trong cột theo thứ tự tăng hoặc giảm dần
- INSERT INTO <table_name> (cols) VALUES (values); : chèn hàng với giá trị và cột tương ứng
- UPDATE <table_name> SET <các giá trị cần cập nhật> WHERE <PK_value>; : cập nhật các giá trị tương ứng trong khoá chính được chỉ định
- DELETE FROM <table_name> WHERE <condition>; : xoá hàng trong bảng với điều kiện phù hợp

# 6. Hashing với bcrypt

- Khi một chuỗi (mật khẩu) được băm bằng thuật toán bcrypt sẽ tạo ra một chuỗi ở dạng băm. Mục tiêu để làm chậm quá trình suy đoán mật khẩu, làm tiêu hao tài nguyên CPU và thời gian của một ai đó :))
- Chuỗi ở dạng băm bao gồm Thuật toán, Số vòng lặp, Salt và Hash kết quả.
- Chuỗi (mật khẩu) đã băm này sẽ được lưu trên server để thay thế cho chuỗi thô ban đầu để tăng tính bảo mật thông tin.
- Khi đăng nhập, người dùng sẽ nhập chuỗi (mật khẩu) thô, API sẽ lấy mật khẩu đã lưu trong server, tách Salt từ chuỗi đó.
- Dùng Salt đã tách để băm lại chuỗi (mật khẩu) thô người dùng vừa nhập.
- Nếu kết quả băm chuỗi thô trùng với kết quả băm đã lưu trên server thì quá trình xác thực thành công, nếu không sẽ từ chối đăng nhập.

# 7. Quá trình đăng nhập, xác thực JWT và Oauth2 - Sanjeev Thiyagarajan

- Bạn cung cấp thông tin đăng nhập của mình, bạn sẽ được API cung cấp một mã token và sau đó bất cứ khi nào bạn muốn truy cập thứ gì yêu cầu bạn phải đăng nhập, bạn chỉ cần gửi kèm mã token trong yêu cầu. Mục tiêu của mã token để bảo mật quá trình trao đổi dữ liệu sau khi đã đăng nhập.
- Mã token JWT là một chuỗi gồm ba phần được băm (có thể suy ra được chuỗi gốc khi biết chuỗi đã băm):
  - header: chứa các tham số thuật toán ký (HS256) và loại token (JWT)
  - payload: có thể gửi bất cứ thông tin nào trong đây (tránh gửi mật khẩu vì có thể dịch ngược), không nên nhồi nhét nhiều thông tin trong đây vì có thể làm chậm băng thông
  - verify signature: là sự kết hợp của header, payload và một mã đặc biệt lưu trên API.
- Khi người dùng cung cấp mã token JWT, lúc này API sẽ tách tiêu đề và payload, rồi kết hợp với mã đặc biệt lưu trên API tạo lại verify signature, cuõi cùng so sánh verify signature tạo với verify signature người dùng gửi, nếu giống thì cho phép truy cập nội dung.
- Cách check mã token trên laptop: F12 >> Application >> Cookies >> server_name
- Khi lập trình thì phần đóng gói và phần tạo mã token sẽ được thực hiện ở những đường dẫn "/login", sau đó nếu đường dẫn nào muốn sử dụng thì sẽ phải thực hiện xác nhận mã. Khi đăng xuất tài khoản thì ở những đường dẫn "/logout" cần phải xoá mã token đi.
