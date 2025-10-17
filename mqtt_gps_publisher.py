import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime
import random

# --- Cấu hình broker MQTT ---
broker_address = "192.168.1.10"   # Địa chỉ broker trong LAN (hoặc cloud)
topic = "gps/data"

# --- Tạo client MQTT ---
client = mqtt.Client()
client.connect(broker_address, 1883, 60)
print(f"Đã kết nối tới broker MQTT: {broker_address}")

# --- Vòng lặp gửi dữ liệu ---
while True:
    # Giả lập dữ liệu GPS (bạn thay bằng dữ liệu thật của module)
    gps_data = {
        "lat": round(21.012000 + random.uniform(-0.0005, 0.0005), 6),
        "lon": round(105.812000 + random.uniform(-0.0005, 0.0005), 6),
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    payload = json.dumps(gps_data)
    client.publish(topic, payload)
    print("Đã gửi:", payload)

    time.sleep(2)  # gửi mỗi 2 giây
