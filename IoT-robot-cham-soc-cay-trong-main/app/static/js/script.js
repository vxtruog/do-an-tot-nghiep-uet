// Chọn qua lại giữa các trang trên menu -------------------------------------------------------
function openTab(tabId, element) {
  // Ẩn tất cả tab có class tab-content
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => (el.style.display = "none"));

  // Hiện tab được chọn
  document.getElementById(tabId).style.display = "block";

  // Xóa trạng thái active của tất cả nút
  document
    .querySelectorAll(".tab-menu button")
    .forEach((btn) => btn.classList.remove("active"));

  // Thêm active cho nút được chọn
  element.classList.add("active");
}

// Hiển thị thời gian trên trang chính ----------------------------------------------------------
const timeElement = document.querySelector(".time");
const dateElement = document.querySelector(".date");

/**
 * @param {Date} date
 */
function formatTime(date) {
  const hour12 = date.getHours() % 12 || 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const isAm = date.getHours() < 12;

  return `${hour12.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${
    isAm ? "AM" : "PM"
  }`;
}

/**
 * @param {Date} date
 */
function formatDate(date) {
  const DAYS = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return `${DAYS[date.getDay()]}, ngày ${date.getDate()} tháng ${
    date.getMonth() + 1
  } năm ${date.getFullYear()}`;
}

setInterval(() => {
  const now = new Date();
  timeElement.textContent = formatTime(now);
  dateElement.textContent = formatDate(now);
}, 200);

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const tabId = params.get("tab");

  // MỞ TAB THEO URL
  if (tabId) {
    const tabElement = document.getElementById(tabId);

    if (tabElement) {
      // Ẩn tất cả tab
      document.querySelectorAll(".tab-content").forEach((el) => {
        el.style.display = "none";
      });

      // Hiện tab được chọn
      tabElement.style.display = "block";

      // Bỏ class 'active' của tất cả nút
      document.querySelectorAll(".tab-menu button").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Tìm nút có onclick gọi openTab với tabId tương ứng
      const matchingButton = Array.from(
        document.querySelectorAll(".tab-menu button")
      ).find((btn) =>
        btn.getAttribute("onclick")?.includes(`openTab('${tabId}'`)
      );

      if (matchingButton) {
        matchingButton.classList.add("active");
      }
    }
  }

  if (params.has("success") && params.get("success") === "registered") {
    const username = params.get("username") || "";
    showToast(`Đã thêm ${username} vào danh sách thành viên!`);
  }

  // Xóa query string sau khi hiển thị toast
  window.history.replaceState({}, document.title, window.location.pathname);
});


// Hiển thị Toast khi làm gì đó thành công --------------------------------------------------------
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = "toast";
  if (isError) toast.classList.add("error");

  document.body.appendChild(toast);

  // cho browser nhận class show
  setTimeout(() => toast.classList.add("show"), 10);

  // 2.5 giây sau ẩn toast
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 500); // xóa khỏi DOM sau khi ẩn
  }, 2500);
}

// Hiện popup khi xoá người dùng để xác nhận ---------------------------------------------------
let selectedUserId = null;
function openDeletePopup(userId) {
  selectedUserId = userId;
  document.getElementById("popup").classList.add("active");
}

function closeDeletePopup() {
  document.getElementById("popup").classList.remove("active");
}

async function deleteUser(userId) {
  try {
    const response = await fetch(`/users/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Xoá hàng khỏi bảng
      const row = document.getElementById(`user-${userId}`);
      if (row) row.remove();

      // Dùng toast của bạn
      showToast("Xoá thành công!");
    } else {
      showToast("Xoá thất bại!", true);
    }
  } catch (error) {
    console.error(error);
    showToast("Đã xảy ra lỗi!", true);
  }
}

document
  .getElementById("confirm-delete")
  .addEventListener("click", async () => {
    if (selectedUserId) {
      await deleteUser(selectedUserId);
      closeDeletePopup();
    }
  });

//----------------------------------------------------------------------------
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

// --- Firebase config ---
export const firebaseConfig = {
  apiKey: "AIzaSyBYPkjqFb1dDWtZsVT9F7KLs_C5Mk-RJu4",
  authDomain: "robot-cham-soc-cay-trong.firebaseapp.com",
  databaseURL: "https://robot-cham-soc-cay-trong-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "robot-cham-soc-cay-trong",
  storageBucket: "robot-cham-soc-cay-trong.firebasestorage.app",
  messagingSenderId: "717915319389",
  appId: "1:717915319389:web:22a8383aa8e3f38f1d71b4"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// === Lắng nghe dữ liệu GPS tại /gps_data ===
const gpsRef = ref(db, '/gps_data');

// === Truy cập các phần tử HTML ===
const latSpan = document.getElementById('gps-lat');
const lngSpan = document.getElementById('gps-lng');
const timeSpan = document.getElementById('time');
const connectSpan = document.getElementById('connect');
// --- canvas ---
const canvas = document.getElementById('path-canvas');
const ctx = canvas.getContext('2d');
let points = [];

// === Lắng nghe dữ liệu realtime ===
onValue(gpsRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    latSpan.textContent = data.latitude?.toFixed(8) ?? "N/A";
    lngSpan.textContent = data.longitude?.toFixed(8) ?? "N/A";
    timeSpan.textContent = new Date(data.timestamp).toLocaleTimeString('vi-VN');
    connectSpan.textContent = "Có tín hiệu";
    connectSpan.style.color = "green";
    updatePath(data.lat, data.lng);
  } else {
    connectSpan.textContent = "Mất tín hiệu";
    connectSpan.style.color = "red";
  }
}, (error) => {
  connectSpan.textContent = "Lỗi kết nối Firebase";
  connectSpan.style.color = "red";
  console.error(error);
});

// // === Hàm vẽ đường đi ===
// function updatePath(lat, lng) {
//   points.push({ lat, lng });
//   if (points.length > 1) {
//     const last = points[points.length - 2];
//     const now = points[points.length - 1];
//     ctx.beginPath();
//     ctx.moveTo((last.lng - 105.84) * 10000, (21.05 - last.lat) * 10000);
//     ctx.lineTo((now.lng - 105.84) * 10000, (21.05 - now.lat) * 10000);
//     ctx.strokeStyle = "blue";
//     ctx.lineWidth = 2;
//     ctx.stroke();
//   }
// }

// // === Hàm xoá đường đi ===
// window.clearHistory = function() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   points = [];
// };





//----------------------------------------------------------------------------
// let map, gpsMarker;
// let moving = false;
// let pathHistory = [];
// let ctx;

// window.onload = () => {
//   initMap();
//   ctx = document.getElementById("path-canvas").getContext("2d");
// };

// function initMap() {
//   const startPos = { lat: 21.045, lng: 105.84790 };

//   map = new google.maps.Map(document.getElementById("map"), {
//     zoom: 18,
//     center: startPos,
//     fullscreenControl: false,
//     zoomControl: false,
//     mapTypeControl: false,
//     streetViewControl: false,
//     gestureHandling: "none"
//   });

//   gpsMarker = new google.maps.Marker({
//     position: startPos,
//     map: map,
//     title: "Vị trí GPS",
//     icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
//   });
// }

// function interpolatePosition(start, end, fraction) {
//   return {
//     lat: start.lat + (end.lat - start.lat) * fraction,
//     lng: start.lng + (end.lng - start.lng) * fraction
//   };
// }

// function updateGpsMarker() {
//   if (moving) return;

//   const newLat = parseFloat(document.getElementById("gps-lat").value);
//   const newLng = parseFloat(document.getElementById("gps-lng").value);
//   const endPos = { lat: newLat, lng: newLng };
//   const startPos = gpsMarker.getPosition().toJSON();

//   const numSteps = 50;
//   const stepTime = 50;
//   let step = 0;
//   moving = true;

//   function animate() {
//     step++;
//     const pos = interpolatePosition(startPos, endPos, step / numSteps);
//     gpsMarker.setPosition(pos);
//     map.setCenter(pos);

//     if (step % 5 === 0 || step === numSteps) {
//       pathHistory.push(pos);
//       drawPathOnCanvas();
//     }

//     if (step < numSteps) {
//       setTimeout(animate, stepTime);
//     } else {
//       moving = false;
//     }
//   }

//   animate();
// }

// function drawPathOnCanvas() {
//   const c = document.getElementById("path-canvas");
//   const w = c.width, h = c.height;
//   ctx.clearRect(0, 0, w, h);

//   if (pathHistory.length < 2) return;

//   const lats = pathHistory.map(p => p.lat);
//   const lngs = pathHistory.map(p => p.lng);
//   const minLat = Math.min(...lats), maxLat = Math.max(...lats);
//   const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

//   const scaleX = w / (maxLng - minLng || 0.00001);
//   const scaleY = h / (maxLat - minLat || 0.00001);
//   const scale = Math.min(scaleX, scaleY) * 0.9;

//   const offsetX = (w - (maxLng - minLng) * scale) / 2;
//   const offsetY = (h - (maxLat - minLat) * scale) / 2;

//   ctx.beginPath();
//   ctx.moveTo(
//     offsetX + (pathHistory[0].lng - minLng) * scale,
//     h - (offsetY + (pathHistory[0].lat - minLat) * scale)
//   );
//   for (let i = 1; i < pathHistory.length; i++) {
//     ctx.lineTo(
//       offsetX + (pathHistory[i].lng - minLng) * scale,
//       h - (offsetY + (pathHistory[i].lat - minLat) * scale)
//     );
//   }
//   ctx.strokeStyle = "#FF0000";
//   ctx.lineWidth = 2;
//   ctx.stroke();

//   const start = pathHistory[0];
//   const end = pathHistory[pathHistory.length - 1];
//   drawDot(start, minLat, minLng, scale, w, h, offsetX, offsetY, "#00AA00");
//   drawDot(end, minLat, minLng, scale, w, h, offsetX, offsetY, "#FF0000");
// }

// function drawDot(p, minLat, minLng, scale, w, h, offsetX, offsetY, color) {
//   const x = offsetX + (p.lng - minLng) * scale;
//   const y = h - (offsetY + (p.lat - minLat) * scale);
//   ctx.beginPath();
//   ctx.arc(x, y, 4, 0, 2 * Math.PI);
//   ctx.fillStyle = color;
//   ctx.fill();
// }

// function clearHistory() {
//   pathHistory = [];
//   const c = document.getElementById("path-canvas");
//   ctx.clearRect(0, 0, c.width, c.height);
// }

window.openTab = openTab;
window.openDeletePopup = openDeletePopup;
window.closeDeletePopup = closeDeletePopup;
window.deleteUser = deleteUser;
window.showToast = showToast;
