# Cài đặt chung
```
sudo apt update
sudo apt upgrade -y
python3 -m pip install --upgrade pip
pip install --upgrade paho-mqtt
```
# Trên RASPBERRY PI - Broker
- Cài đặt Mosquitto
```
sudo apt install mosquitto mosquitto-clients -y
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```
- Cho phép truy cập MQTT từ nhiều thiết bị trong mạng LAN
```
sudo nano /etc/mosquitto/mosquitto.conf
>> thêm dòng
listener 1883 0.0.0.0
allow_anonymous true
>> lưu lại
sudo systemctl restart mosquitto
```
- Tệp gps_subcriber.py
```
import paho.mqtt.client as mqtt

def on_message(client, userdata, msg):
    data = msg.payload.decode()
    lat, lon = data.split(',')
    print(f"Received GPS → Latitude: {lat}, Longitude: {lon}")

BROKER = "localhost"  # vì Pi đang là broker
TOPIC = "gps/topic"

client = mqtt.Client()
client.on_message = on_message
client.connect(BROKER, 1883, 60)
client.subscribe(TOPIC)
client.loop_forever()
```
- Chạy thử
```
python3 gps_subcriber.py
```

# Trên LAPTOP/JETSON NANO
- Cài đặt Mosquitto
```
sudo apt install mosquitto-clients -y
```
- Tệp gps_publisher.py
```
import paho.mqtt.client as mqtt
import time
import random

# Thông tin broker (địa chỉ IP của Raspberry Pi)
BROKER = "192.168.1.xxx"   # <-- thay bằng IP thật của Raspberry Pi
PORT = 1883
TOPIC = "gps/topic"

client = mqtt.Client()
client.connect(BROKER, PORT, 60)

while True:
    # Giả lập toạ độ GPS
    lat = 21.0278 + random.uniform(-0.0005, 0.0005)
    lon = 105.8342 + random.uniform(-0.0005, 0.0005)

    payload = f"{lat},{lon}"
    client.publish(TOPIC, payload)
    print(f"Sent: {payload}")
    time.sleep(2)
```
- Chạy thử
```
python3 gps_publisher.py
```

