# CSS

## 1. Thuộc tính liên quan đến text

- font-size: kích thước chữ
- color: màu chữ
- font-family: kiểu chữ
- font-weight: độ đậm của chữ
- line-height: điều chỉnh khoảng cách giữa các dòng trong đoạn văn
- letter-spacing: khoảng cách giữa các chữ cái
- text-align: căn chỉnh văn bản

## 2. Thuộc tính liên quan đến box

- margin: lớp ngoài cùng, tạo khoảng cách giữa phần tử này với phần tử khác
- border: lớp viền bao quanh phần tử
- padding: khoảng cách từ nội dung đến đường viền
- content: lớp trong cùng, chứa nội dung của phần tử
- box-sizing: border-box : width và height sẽ bao gồm cả border

## 3. Thuộc tính liên quan đến hình ảnh

- object-fit: phù hợp ảnh trong khung theo nhiều kiểu
- object-position: x% y% : căn chỉnh vị trí của ảnh trong khung
- background-color: tạo màu nền trong đoạn văn bản
- background-image: đặt hình ảnh làm phông nền
- background-repeat: có lặp lại ảnh để chèn đầy nền không
- background-size: kích thước ảnh trong nền

## 4. Thuộc tính liên quan đến hiển thị

- display: cách hiển thị các phần tử trên trang web
- display: block : mỗi phần tử chiếm một dòng, đẩy phần tử khác xuống dòng mới
- display: inline : phần tử chiếm chỗ đủ cho nó
- display: inline-block : không đẩy phần tử xuống dòng, có thể dùng width và height để chỉnh kích thước cho phần tử
- display: flex : căn chỉnh các phần tử theo trục

## 5. Thuộc tính liên quan đến vị trí

- position: cách một phần tử được đặt trên trang
- position: static : nằm một cách tự nhiên trên trang
- position: relative : có thể di chuyển phần tử dựa trên bố cục
- position: absolute : căn chỉnh theo phần tử relative hoặc những phần tử không phải static

## 6. Bóng đổ

- box-shadow: đổ bóng hộp
- filter(): drop-shadow() : đổ bóng cho hình ảnh
- text-shadow: đổ bóng cho chữ
- opacity: độ trong suốt
- visibility: khả năng hiển thị
- z-index: giá trị càng lớn thì càng hiển thị trước các phần tử khác, chỉ xếp chồng khi cùng cha

## 7. Cụ thể hơn về display: flex

- flex-container: lớp cha để quyết định điều khiển và phân phối các phần tử bên trong, khai báo class="container"
- flex-item: các phần tử con bên trong container, khai báo class="item"
- flex-direction: hướng sắp xếp các phần tử con bên trong, mặc định là ngang, có thể đặt column để chuyển dọc
- kết hợp thuộc tính gap để cách nhau giữa các phần tử
- justily-content: xác định cách sắp xếp các item theo trục chính, flex-start (dồn mép trái), flex-end(dồn mép phải), center, space-between, ...
- align-items: căn chỉnh các phần tử theo trục phụ
- flex-wrap: có xuống dòng nếu các phần tử không đủ chỗ không
- flex-grow: có dãn ra để đủ khoảng trống trong container không
- flex-shrink: có thu hẹp khi không đủ chỗ không
