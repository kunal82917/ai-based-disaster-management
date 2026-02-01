/* ============================
   MEDIA VIEWER
============================ */

function openViewer(src, type = "image") {
  const viewer = document.getElementById("image-viewer");
  const content = document.getElementById("viewer-content");
  if (!viewer || !content || !src) return;

  content.innerHTML = "";
  let mediaEl;
  if (type === "video") {
    mediaEl = document.createElement("video");
    mediaEl.src = src;
    mediaEl.controls = true;
    mediaEl.autoplay = true;
  } else {
    mediaEl = document.createElement("img");
    mediaEl.src = src;
    mediaEl.alt = "Evidence";
  }
  mediaEl.style.maxWidth = "100%";
  mediaEl.style.maxHeight = "80vh";
  content.appendChild(mediaEl);
  viewer.classList.remove("hidden");
}

function closeViewer() {
  const viewer = document.getElementById("image-viewer");
  if (viewer) viewer.classList.add("hidden");
}

/* ============================
   SUCCESS MODAL
============================ */

function showSuccess(message = "Success") {
  const overlay = document.getElementById("success-overlay");
  const msgEl = document.getElementById("success-msg");
  if (!overlay || !msgEl) return;
  msgEl.innerText = message;
  overlay.classList.remove("hidden");
}

function closeSuccess() {
  const overlay = document.getElementById("success-overlay");
  if (overlay) overlay.classList.add("hidden");
  routeTo("home");
}

/* ============================
   NOTIFICATIONS
============================ */

function showNotification(message, type = "info") {
  const container = document.getElementById("notification-container");
  if (!container || !message) return;
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  container.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

/* ============================
   CONTACT INFO
============================ */

function displayContactInfo() {
  if (typeof contactSettings !== "object") return;
  const emailEl = document.getElementById("contact-email");
  const phoneEl = document.getElementById("contact-phone");
  const addrEl = document.getElementById("contact-address");
  if (emailEl) emailEl.textContent = contactSettings.email || "";
  if (phoneEl) phoneEl.textContent = contactSettings.phone || "";
  if (addrEl) addrEl.textContent = contactSettings.address || "";
}
