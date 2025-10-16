# MQTT
- MQTT (Message Queuing Telemetry Transport) là giao thức truyền tải tin nhắn publish/subscribe của client thông qua broker.
- Nằm trên TCP/IP:
	+ MQTT yêu cầu TCP/IP.
	+ Kết nối TCP liên tục.
	+ Cơ chế nhịp tim.
	+ Bảo mật ở cấp độ truyền tải (TLS).
- Băng thông nhẹ, triển khai đơn giản, thực hiện phiên làm việc một cách liên tục và có khả năng làm việc với nhiều loại dữ liệu khác nhau.
- Ngay cả khi mạng yếu, không ổn định, mất gói tin, hoặc có độ trễ cao, thì MQTT vẫn đảm bảo dữ liệu được truyền đi đầy đủ, đúng thứ tự và không bị mất.

# Publish/Subscribe Pattern
- MQTT Clients (Publish) <--> MQTT Broker <--> MQTT Clients (Subscribe)
- Đặc điểm:
	+ Tách rời về mặt không gian (Pub và Sub không cần phải ở trong cùng một phòng/múi giờ).
	+ Tách rời về mặt thời gian (Pub có thể gửi dữ liệu đến Broker trong khi Sub ngoại tuyến, Broker sẽ xếp hàng tin nhắn và chuyển dữ liệu cho Sub khi Sub trực tuyến trở lại).
	+ Tách rời về mặt đồng bộ (Pub không cần đợi cho đến khi Sub sử dụng dữ liệu).
	+ Pub/Sub có quy mô rộng hơn so với cách tiếp cận Client/Server truyền thống.
	+ Một vấn đề về lỗi: Broker là trung tâm giao tiếp nên khi xảy ra lỗi ở đây thì toàn bộ hệ thống đều không thể gửi và nhận dữ liệu => chọn phầm mềm broker hỗ trợ phân cụm để khắc phục.

# Client Broker Connection Establishment
- MQTT Client sẽ thiết lập kết nối TCP với MQTT Broker, có thể sử dụng TLS để kênh liên lạc được mã hoá. Và luồng kết nối MQTT sẽ bắt đầu.
- MQTT Client sẽ gửi gói kết nối tới MQTT Broker, sau đó MQTT Broker sẽ thực hiện xác thực xem MQTT Client đó có thể được kết nối không, nếu được kết nối thì có những đặc quyền gì.
- Sau đó, MQTT Client sẽ nhận được gói CONNACK (thông báo xem có được chấp nhận kết nối không).

# Publish/Subscribe/Unsubscribe
- Publish, để tạo dữ liệu:
	+ topicName: tên chủ đề.
	+ qos: chất lượng dịch vụ.
	+ retainFlag: cờ lưu trữ.
	+ payload: chịu trách nhiệm mang những thông tin liên quan đến topic.
	+ dupFLag: cờ trùng lặp.
	+ packetId.
	=> Pub sẽ gửi gói dữ liệu cho Broker, Broker sẽ tìm ra ai đã subscribe và sau đó gửi cùng một gói cho nhiều Sub.
- Subscribe, nhận luồng dữ liệu:
	+ Sub sẽ gửi một gói tin chứa các cặp topic + qos (danh sách chủ đề + chất lượng dịch vụ).
	+ packetID
	=> Broker sẽ gửi lại cho Sub một gói SUBACK để cho Sub biết liệu nó có được subcribe không.
- Unsubscribe, huỷ bỏ tham gia vào các topic:
	+ Sub sẽ gửi một gói chứa các topic mà nó muốn huỷ subscribe.
	+ packetID
	=> Broker sẽ xác nhận gói đó với lệnh huỷ subscribe

# Topic
- Topic đề cập đến một chuỗi UTF-8.
- Broker sử dụng các topic để lọc tin nhắn cho từng client được kết nối.
- Một topic bao gồm một hoặc nhiều cấp độ.
- Mỗi cấp độ topic được phân tách bằng dấu '/'.
- Wildcards:
	+ Dấu '+' để cho biết những cấp độ cùng với cấp độ của nó sẽ được chọn, với điều kiện các cấp độ khác cấp độ này phải cùng tên.
	+ Dấu '#' để cho biết những cấp độ từ cấp độ này trở đi sẽ được chọn, với điều kiện các cấp độ trước nó phải cùng tên.
- Lưu ý:
	+ Không sử dụng dấu '/' lên phía trước cấp độ đầu.
	+ Không sử dụng dấu cách trong một topic.
	+ Chỉ sử dụng ký tự ASCII, tránh các ký tự đặc biệt.
	+ Giữ tên topic ngắn gọn và súc tích.
	+ Nhúng mã định danh duy nhất hoặc ID client vào topic.
	+ Không sử dụng # lên đầu, khi đó mọi thông tin được công khai và nó có thể làm quá tải băng thông, không phù hợp với MQTT.

# Quality of Service Levels
- Đảm bảo phân phối giữa những thành viên tham gia giao tiếp.
- MQTT biết ba cấp độ qos:
	+ Tối đa một lần phân phối (qos 0).
	+ Ít nhất một lần phân phối (qos 1).
	+ Chính xác một lần phân phối (qos 2).
- Qos 0: MQTT Client gửi dữ liệu cho MQTT Broker nhưng không cần Broker phản hồi, điều này có thể mất mát dữ liệu.
- Qos 1: MQTT Client gửi dữ liệu cho MQTT Broker và MQTT Broker sẽ gửi PUBACK để phản hồi, giảm thất thoát dữ liệu, nhưng có thể bị nhận một bản sao tin nhắn.
- Qos 2: MQTT Client gửi dữ liệu cho MQTT Broker, MQTT Broker phản hồi PUBREC, MQTT Client tiếp nhận PUBREC và phản hồi PUBREL, MQTT nhận PUBREL và phản hồi PUBCOMP để hoàn tất tin nhắn, tránh thất thoát dữ liệu, tránh nhận bản sao tin nhắn nhưng chi phí cao.

# Session (phiên làm việc)
- Persistent Session (phiên liên tục)
  + Được ghi nhớ bởi Broker.
  + Sự phức tạp được chuyển sang Broker.
  + Được bật bằng cách đặt cờ cleanSession thành False trong gói kết nối.
  + Được hỗ trợ bởi tất cả các thư viện client.
- Clean Session (phiên sạch)
  + Tất cả thông tin máy khách được lưu trữ sẽ bị xoá ngay khi client ngắt kết nối.
- Broker sẽ ghi nhớ những thông tin nào trong phiên liên tục?
  + Dữ liệu phiên (ví dụ thông tin ID Client).
  + Các subscribe cụ thể của client.
  + Những tin nhắn Qos chưa được xác nhận.
  + Thứ tự xếp hàng tin nhắn.
- Làm thế nào để một phiên được tiếp tục?
  + Broker sử dụng cờ sessionPresent để thông báo cho Client biết liệu phiên có thể được tiếp tục hay không.
  + Được hỗ trợ bởi hầu hết các thư viện Client.
- Chú ý:
  + Clean Session được khuyến nghị khi client chỉ có vai trò pub và chấp nhận mất mát tin nhắn.
  + Persistent Session được khuyến nghị khi sub không được bỏ lỡ tin nhắn, Broker cần phải lưu trữ thông tin subscribe.
  + Kiểm tra thời hạn tin nhắn để loại bỏ các tin nhắn rất lâu không được sử dụng.

# Messages
- Queued messages (xếp hàng tin nhắn)
  + Tin nhắn được xếp hàng cho mỗi Client.
  + Broker xếp hàng tất cả các tin nhắn Qos 1 và Qos 2 khi một phiên liên tục của client đang ngoại tuyến.
  + Tin nhắn Qos 0 không bao giờ được xếp hàng.
- Retained Messages (tin nhắn được lưu trữ)
  + Rất có ích khi cần có trạng thái bắt đầu, đảm bảo client nhận được giá trị được lưu trữ cuối ngay sau khi subscribe.
  + Broker chỉ lưu trữ một tin nhắn cho mỗi chủ đề, nếu thêm thì sẽ ghi đè lên tin nhắn cũ hơn.
  + Không cần thiết phải xoá tin nhắn được lưu trữ trong hầu hết các trường hợp, nhưng nếu muốn xoá, hãy gửi tin nhắn trống đến và nó ghi đè lên tin nhắn cũ hơn.

# Last Will and Testament (LWT)
- LWT là một thông báo đến các client khác khi một client ngắt kết nối một cách bất thường.
- gói CONNECT và LWT:
	+ lastWillTopic
	+ lastWillQos
	+ lastWillMessage
	+ lastWillRetain
- Bối cảnh sử dụng LWT
	+ khi Broker phát hiện ra lỗi mạng.
	+ Client không liên lạc trong thời gian xác định trước (keep alive).
	+ Client không gửi gói DISCONNECT trước khi nó đóng kết nối mạng.
	+ Broker đóng kết nối mạng do lỗi giao thức.

# Keep Alive and Client Takeover
- Cơ chế Keep Alive đảm bảo rằng kết nối giữa client và broker đang mở, và cả hai đều nhận thức việc đang kết nối.
- 60 giây là chu kỳ mặc định để chờ một gói tin, thời gian này có thể thiết lập đến 18 giờ.
- Nó có thể bị vô hiệu hoá (không khuyên dùng).

# Client Takeover
- Khi Client không nhận được phản hồi của Broker, nó sẽ kết nối lại. Khi Broker nhận được yêu cầu, nó sẽ xoá kết nối cũ và kết nối lại.



# MQTT 5
- Mục tiêu chính
	+ Cải thiện báo cáo lỗi.
	+ Hiệu suất và khả năng mở rộng tốt hơn.
	+ Cải thiện hỗ trợ cho các máy khách nhỏ hơn.
	+ Chính thức hoá các mẫu thường dùng.
- Những tính năng thay đổi
	+ Tính năng mới: Thuộc tính người dùng
	+ 128 reason codes (chỉ 19 đối với MQTT 3.1.1).
	+ cho Client biết những đặc tính CONNACK Return Codes nào không được hỗ trợ.
	+ Clean Session bây giờ là Clean Start.
	+ Có gói AUTH Packet mới.
	+ Loại dữ liệu mới: UTF-8 String Pairs. Nâng tổng số các loại dữ liệu hỗ trợ lên 7:
		++ Two byte integer
		++ Four byte integer
		++ UTF-8 Encoded String
		++ Variable byte integer
		++ Binary Data
		++ UTF-8 String Pair
	+ Gói DISCONNECT hai chiều
	+ Broker và Clients không được phép truyền lại tin nhắn MQTT để kết nối TCP được tốt hơn.
	+ Sử dụng mật khẩu mà không có tên người dùng để xác thực trong gói kết nối.

- Session and Message Expiry Intervals (Hết hạn phiên và hết hạn tin nhắn)
	+ Hết hạn tin nhắn
		++ Tin nhắn không được phân phối cho clients offline được xếp hàng bởi broker.
		++ Tin nhắn đã được chuyển đi sẽ không hết hạn đối với broker.
	+ Thay đổi giao thức:
		++ Ở trong MQTT 5 sessionExpiry cùng với cleanStart sẽ thay thế cleanSession trong MQTT 3.

- Improved Client Feedback & Negative Acknowledgement (Cải thiện phản hồi của Client và những Xác nhận tiêu cực)
	+ Cải thiện phản hồi của Client:
		++ khả năng sửa lỗi tốt hơn.
		++ đảm bảo tính nhất quán trong nhiều lần triển khai MQTT.
		++ Broker giờ đây có thể cho Client biết về loại tính năng mà nó hỗ trợ.
		++ Tuỳ chọn tính năng:
			Retain messages
			Wildcard subscriptions
			Shared subscriptions
			Subscription identifiers
			Topic aliases
		++ Những tính năng giới hạn bởi Broker:
			mức tối đa Keep Alive
			mức tối đa Session Expiry Interval
			mức tối đa Packet Size
			số lượng tối đa của Topic Aliases mà client có thể gửi
			mức tối đa của Quality of Service mà client có thể sử dụng
		++ Reason codes mới:
			UNSUBACK
			PUBACK
			PUCREC
			PUBREL
			PUBCOMP
			DISCONNECT
			Con người có thể đọc những chuỗi mà cung cấp các bản dịch đến reason codes để dễ dàng chuẩn đoán và sửa lỗi.
		++ Broker gửi các gói ngắt kết nối, chứa lý do tại sao bị ngắt.
	+ Xác nhận tiêu cực
		++ Gửi lại ACK kèm theo lý do ngắt kết nối, chứ không thông báo ngắt kết nối suông.

- User Properties (Thuộc tính người dùng)
	+ Các cặp chuỗi key-value cơ bản.
	+ Có thể được thêm làm tiêu đề cho hầu hết tất cả gói MQTT.
	+ Ngoại trừ PINGREQ và PINGRESP.
	+ Về mặt kỹ thuật đơn giản, nhưng mang lại những khả năng gần như vô hạn để áp dụng logic bổ sung.

- Shared Subscription:
	+ Cơ chế Client load balancing.
	+ Tin nhắn của một topic được phân phối qua nhiều subscriber.
	+ Cú pháp: $share/GroupID/Topic
	+ Được sử dụng khi một lượng lớn client đã gửi dữ liệu và một máy khách không có khả năng xử lý dữ liệu.

- Payload Format Description (Mô tả định dạng tải trọng)
	+ 0 chỉ ra rằng không xác định luồng tải trọng.
	+ 1 chỉ ra rằng có một tải trọng được mã hoá dạng UTF-8
	+ Mô tả định dạng tải trọng các định bước tiếp theo trong tiêu chuẩn ngành công nghiệp cho MQTT với các định dạng tải trọng thay đổi.
	+ Khi sử dụng các định dạng tải trọng khác nhau trong cùng một dự án, nó sẽ đảm bảo mỗi thông báo được khách hàng nhận phân tích cú pháp chính xác mà không cần phải xem bên trong tải trọng thực tế.

- Request-Response Pattern (Mẫu phản hồi yêu cầu)
	+ Response Topic: Xác định chủ đề cho phản hồi.
	+ Correlation Data: Xác định mối tương quan của các tin nhắn và phản hồi được công bố.
	+ Response Information: Cho phép Broker gửi chuỗi UTF-8 tuỳ chọn có thông tin về những phản hồi của topic, cái mà sẽ dự kiến được sử dụng.
	+ Chú ý:
		Bất cứ khi nào có thể, hãy sử dụng thông tin phản hồi.
		Sử dụng định danh duy nhất trong Response Topic.
		Đảm bảo rằng người phản hồi và người yêu cầu dự kiến có quyền publish và subcribe đến các Response topic.
		Người yêu cầu phải luôn subcribe Response Topic trước khi gửi yêu cầu.

- Topic Alias (Chủ đề bí danh)
	+ MQTT client và MQTT broker có thể thương lượng với nhau về mức độ họ muốn hỗ trợ một tính năng.
	+ Được sử dụng để thay thế một số chuỗi topic xác định bằng số nguyên.
	+ Chú ý:
		Ánh xạ Topic Alias đến Topic chỉ luôn phù hợp với kết nối client-broker duy nhất.
		Topic Alias rất hữu ích trong các trường hợp cụ thể khi:
			tải trọng tương đối nhỏ
			chủ đề tương đối dài
			thông lượng tin nhắn tương đối cao

- Enhanced Authentication
	+ Triển khai xác thực theo cách phản hồi thử thách (cải thiện so với MQTT 3 chỉ hỗ trợ xác thực dựa trên thông tin xác thực.
	+ Các phương pháp xác thực phổ biến:
		SCRAM
		Kerberos
	+ Authentication Method và Authentication Data
		cả hai cần phải được đặt trong mọi thông báo của toàn bộ luồng.
		Phương pháp xác thực: chỉ định phương pháp phản hồi thách thức chính xác mà client và broker đã thoả thuận, ví dụ SCRAM-SHA1.
		Dữ liệu xác thực: là thông tin nhị phân, có thể chứa một tập hợp bí mật hoặc các bước giao thức tuỳ ý.
- Flow Control: điều khiển luồng
	+ MQTT client và MQTT có thể thương lượng số lượng tin nhắn publish chưa được xác nhận tối đa mà họ có thể nhận được.
	+ MQTT client đặt Mức nhận tối đa của nó trong gói CONNECT.
	+ Broker phản hồi với Mức nhận tối đa của nó trong gói CONNACK.
	+ Điều khiển luồng đảm bảo rằng việc xử lý tin nhắn không làm quá tải các máy khách có công suất thấp hơn.
	+ Tính năng này giúp tăng cường khả năng tương tác và tính minh bạch.


# TÌM HIỂU THƯ VIỆN paho.mqtt.client
	- Cài đặt paho-mqtt cho phía client:
		pip install paho-mqtt
		pip3 install paho-mqtt (vì Raspberry Pi 3 thường đi kèm với Python 3)
		(trường hợp Raspberry Pi báo lỗi thêm lệnh: sudo rm /usr/lib/python3.11/EXTERNALLY-MANAGED)
	- mqtt.Client(client_id, client_session, userdata, protocol, transport, tls, protocol_version)
	Được sử dụng để tạo một đối tượng client MQTT mới
		client_id: chuỗi định danh duy nhất cho client MQTT, dùng để phân biệt các client khác nhau kết nối với cùng một broker MQTT
		client_session: một boolean cho biết liệu phiên kết nối mới có nên xoá các thông tin phiên trước hay không. (True: không lưu thông tin phiên trước, False: lưu thông tin phiên trước)
		userdata: một đối tượng tuỳ ý mà bạn muốn truyền cho client MQTT
		protocol: giao thức sử dụng, mặc định là MQTTv311
		transport: loại kết nối được sử dụng, mặc định là "tcp" nhưng cũng có thể là "websockets" hoặc "websocket"
		tls: một đối tượng SSL/TLS để cung cấp các tuỳ chọn bảo mật cho kết nối
		protocol_version: phiên bản giao thức MQTT sử dụng
	- client.on_connect(), trả về bốn tham số (client, userdata, flags, rc), các tham số thường được truyền vào một hàm khác để xử lý sự kiện
	Được sử dụng để đăng ký một hàm xử lý sự kiện khi client MQTT kết nối thành công với broker MQTT
		client: đối tượng client MQTT hiện tại, bạn có thể sử dụng tham chiếu này để truy cập các phương thức và thuộc tính của client trong hàm xử lý.
		userdata: dữ liệu người dùng tuỳ chọn, được truyền lại cho hàm xử lý sự kiện
		flags: chứa các cờ từ broker MQTT
		rc: mã trạng thái kết nối trả về từ broker MQTT sau khi kết nối, mã này có thể được sử dụng để kiểm tra xem kết nối đã thành công hay không (0: thành công, mã khác có thể xác định nguyên nhân của kết nối thất bại)
	- client.loop_start(), không có tham số
	Được sử dụng để bắt đầu một luồng riêng biệt (vòng lặp chính) để theo dõi các sự kiện MQTT mà không chặn luồng chính của ứng dụng.
	- client.connect(broker, port, client_id, keepalive, username, password, client_session)
	Được sử dụng để thiết lập kết nối tới một broker MQTT
		broker: địa chỉ của broker MQTT mà bạn muốn kết nối tới
		port: cổng mà broker MQTT lắng nghe để chấp nhận các kết nối
		client_id: chuỗi định danh duy nhất của client MQTT
		keepalive: thời gian giữ kết nối, là khoảng thời gian mà client sẽ gửi các gói tin giữ kết nối đến broker để duy trì kết nối khi không có hoạt động nào
		username và password: nếu broker yêu cầu xác thực, bạn cần cung cấp username và password tương ứng để thực hiện quá trình kết nối
		clean_session: xác định liệu broker có lưu trữ thông tin phiên của client sau khi client ngắt kết nối hay không (True: xoá thông tin phiên, False: giữ lại thông tin phiên của client cho đến khi phiên hết hạn hoặc client gửi yêu cầu xoá thông tin phiên)
	- client.publish(topic, payload=None, qos=0, retain=False)
	Được sử dụng để gửi một thông điệp đến một chủ đề cụ thể trên broker MQTT mà client đang kết nối đến
	Hàm này được sử dụng sau khi đã kết nối client đến broker và đã bắt đầu vòng lặp chính bằng client.loop_start()
		topic: chủ đề của thông điệp mà bạn muốn gửi đến, đây là một chuỗi
		payload: nội dung của thông điệp, đây có thể là một chuỗi hoặc một dạng dữ liệu có thể chuyển đổi sang chuỗi
		qos: QoS level, mặc định là 0 (at most once), nhưng bạn cũng có thể sử dụng các giá trị 1 (at least once) hoặc 2 (exactly once)
		retain: đặt là true nếu bạn muốn tin nhắn được lưu trữ bởi broker và gửi cho mọi người kết nối mới đến chủ đề, mặc định là false
	- client.loop_stop(), không có tham số
	Được sử dụng để ngừng vòng lặp chính, từ đó client sẽ không tiếp tục nhận và xử lý các tin nhắn mới từ broker MQTT
	- client.disconnect(), không có tham số
	Được sử dụng để yêu cầu client ngắt kết nối với broker MQTT mà nó đang kết nối.
