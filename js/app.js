/* ============================
   INITIALIZATION
============================ */

document.addEventListener("DOMContentLoaded", () => {
  bindNavigation();
  bindGallerySearch();
  displayContactInfo();
  console.log("✓ App initialized");
});

/* ============================
   NAVIGATION
============================ */

function bindNavigation() {
  const navItems = document.querySelectorAll(".nav-item[data-route]");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const route = item.dataset.route;
      routeTo(route);
    });
  });
}

function routeTo(route) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(li => li.classList.remove("active"));

  const section = document.getElementById(route);
  if (section) section.classList.add("active");

  const navItem = document.querySelector(`.nav-item[data-route="${route}"]`);
  if (navItem) navItem.classList.add("active");

  if (route === "dashboard") {
    setTimeout(() => { if (typeof initMap === "function") initMap(); }, 150);
  }

  if (route === "contact") displayContactInfo();
  if (route === "profile") updateProfileDisplay();

  const mainContent = document.getElementById("main-content");
  if (mainContent) mainContent.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================
   STATE SYNC
============================ */

function syncState() {
  if (typeof getAll !== "function") {
    console.warn("getAll function not available");
    return;
  }

  getAll("reports", reports => {
    if (Array.isArray(reports)) {
      updateDashboard(reports);
      updateMapMarkers(reports);
      updateGallery(reports);
      updateAnalytics(reports);
    }
  });

  getAll("alerts", alerts => {
    if (Array.isArray(alerts)) {
      updateAlertsDisplay(alerts);
    }
  });
}

/* ============================
   DASHBOARD
============================ */

function updateDashboard(reports = []) {
  const totalEl = document.getElementById("total-reports");
  const approvedEl = document.getElementById("approved-count");
  const alertsEl = document.getElementById("active-alerts");

  if (!totalEl || !approvedEl || !alertsEl) return;

  const total = reports.length;
  const approved = reports.filter(r => r.approved === true).length;
  const alerts = reports.filter(r => ["Cyclone", "Tsunami", "Storm Surge"].includes(r.type)).length;

  totalEl.innerText = total;
  approvedEl.innerText = approved;
  alertsEl.innerText = alerts;
}

/* ============================
   GALLERY
============================ */

function updateGallery(reports = []) {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  grid.innerHTML = "";
  const mediaReports = reports.filter(r => r.media);

  if (mediaReports.length === 0) {
    grid.innerHTML = "<p style='grid-column:1/-1;text-align:center;color:#777'>No media</p>";
    return;
  }

  mediaReports.forEach(r => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.title = r.desc || "";
    item.style.cursor = "pointer";

    item.addEventListener("click", () => openViewer(r.media, r.mediaType));

    if (r.mediaType === "video") {
      const video = document.createElement("video");
      video.src = r.media;
      video.muted = true;
      item.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = r.media;
      img.alt = "report evidence";
      item.appendChild(img);
    }

    grid.appendChild(item);
  });
}

function bindGallerySearch() {
  const input = document.getElementById("gallery-search");
  if (!input) return;

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    document.querySelectorAll(".gallery-item").forEach(item => {
      item.style.display = item.title.toLowerCase().includes(value) ? "block" : "none";
    });
  });
}

/* ============================
   ALERTS
============================ */

function updateAlertsDisplay(alerts = []) {
  const list = document.getElementById("alerts-list");
  if (!list) return;

  list.innerHTML = "";

  if (alerts.length === 0) {
    list.innerHTML = "<p style='text-align:center;color:#777;padding:20px'>No active alerts</p>";
    return;
  }

  alerts.forEach(alert => {
    const item = document.createElement("div");
    item.className = "alert-item";

    const title = document.createElement("h4");
    title.textContent = alert.title || "Alert";

    const msg = document.createElement("p");
    msg.textContent = alert.message || "";

    const time = document.createElement("small");
    time.textContent = alert.timestamp || "";

    item.appendChild(title);
    item.appendChild(msg);
    item.appendChild(time);

    list.appendChild(item);
  });
}

/* ============================
   DB READY EVENT
============================ */

document.addEventListener("dbReady", () => {
  console.log("✓ DB ready, syncing state");
  syncState();
});
