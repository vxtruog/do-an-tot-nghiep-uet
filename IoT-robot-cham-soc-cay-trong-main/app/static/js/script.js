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
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${isAm ? "AM" : "PM"
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
  return `${DAYS[date.getDay()]}, ngày ${date.getDate()} tháng ${date.getMonth() + 1
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
    updatePath(data.latitude, data.longitude);

    // --- KHỞI TẠO MAP LẦN ĐẦU ---
    if (!mapInitialized && data.latitude && data.longitude) {
      initMap(data.latitude, data.longitude);
      mapInitialized = true;
    }
    // --- CẬP NHẬT MAP + MARKER ---
    if (mapInitialized) {
      updateMap(data.latitude, data.longitude);
    }
  } else {
    connectSpan.textContent = "Mất tín hiệu";
    connectSpan.style.color = "red";
  }
}, (error) => {
  connectSpan.textContent = "Lỗi kết nối Firebase";
  connectSpan.style.color = "red";
  console.error(error);
});


//----------------------------------------------------------------------------
let map = null;
let gpsMarker = null;
let mapInitialized = false;

function initMap(lat, lng) {

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: { lat, lng },
    fullscreenControl: false,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    gestureHandling: "none"
  });

  gpsMarker = new google.maps.Marker({
    position: { lat, lng },
    map: map,
    title: "Vị trí Robot",
    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
  });

  mapInitialized = true;
}

function updateMap(lat, lng) {
  if (!mapInitialized) return;

  const pos = { lat, lng };
  gpsMarker.setPosition(pos);
  map.panTo(pos);
}

// --- vẽ đường đi lên canvas ---
function updatePath(lat, lng) {
  if (!lat || !lng) return;

  points.push({ lat, lng });
  if (points.length > 1000) points.shift();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Tìm bounding box toàn bộ lịch sử
  let minLat = Math.min(...points.map(p => p.lat));
  let maxLat = Math.max(...points.map(p => p.lat));
  let minLng = Math.min(...points.map(p => p.lng));
  let maxLng = Math.max(...points.map(p => p.lng));

  // Khoảng thay đổi lat/lng
  let dataWidth = maxLng - minLng;
  let dataHeight = maxLat - minLat;

  // ✅ ÉP min range để tránh zoom quá nhỏ khi robot di chuyển ít
  const MIN_RANGE = 0.00002; // ~ 2 mét (bạn có thể chỉnh 0.00001 nếu muốn zoom mạnh hơn)

  if (dataWidth < MIN_RANGE) dataWidth = MIN_RANGE;
  if (dataHeight < MIN_RANGE) dataHeight = MIN_RANGE;

  // Vùng vẽ (80% canvas - padding 10% mỗi bên)
  const padding = 0.1;
  const drawableWidth = canvas.width * (1 - padding * 2);
  const drawableHeight = canvas.height * (1 - padding * 2);

  // Tỷ lệ zoom
  const scaleX = drawableWidth / dataWidth;
  const scaleY = drawableHeight / dataHeight;
  const scale = Math.min(scaleX, scaleY);

  // Offset để hình nằm chính giữa
  const offsetX = (canvas.width - dataWidth * scale) / 2;
  const offsetY = (canvas.height - dataHeight * scale) / 2;

  // ✅ Vẽ đường đi
  ctx.beginPath();
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 0.8;

  points.forEach((p, i) => {
    const x = offsetX + (p.lng - minLng) * scale;
    const y = canvas.height - (offsetY + (p.lat - minLat) * scale);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  // ✅ Vẽ điểm cuối (robot hiện tại)
  const last = points[points.length - 1];
  const lx = offsetX + (last.lng - minLng) * scale;
  const ly = canvas.height - (offsetY + (last.lat - minLat) * scale);

  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
}

window.clearHistory = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  points = [];
};
window.openTab = openTab;
window.openDeletePopup = openDeletePopup;
window.closeDeletePopup = closeDeletePopup;
window.deleteUser = deleteUser;
window.showToast = showToast;
