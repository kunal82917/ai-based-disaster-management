/* ============================
   CONSTANTS
============================ */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DESC_LENGTH = 10;

/* ============================
   INITIALIZATION
============================ */

document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit-report-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      submitReport();
    });
  }

  const descInput = document.getElementById("hDesc");
  if (descInput) {
    descInput.addEventListener("input", () => {
      const counter = document.getElementById("desc-counter");
      if (counter) {
        const len = Math.min(descInput.value.length, 500);
        counter.innerText = `${len}/500`;
      }
    });
  }
});

/* ============================
   REPORT SUBMISSION
============================ */

function submitReport() {
  if (!isLoggedIn()) {
    showNotification("Please log in first", "error");
    return;
  }

  const hType = document.getElementById("hType");
  const hDesc = document.getElementById("hDesc");
  const hMedia = document.getElementById("hMedia");

  if (!hType || !hDesc || !hMedia) {
    showNotification("Form elements missing", "error");
    return;
  }

  const type = hType.value;
  const desc = hDesc.value.trim();
  const file = hMedia.files[0];

  if (!type) {
    showNotification("Select hazard type", "error");
    return;
  }

  if (desc.length < MIN_DESC_LENGTH) {
    showNotification(`Description at least ${MIN_DESC_LENGTH} chars`, "error");
    return;
  }

  if (!file) {
    showNotification("Upload evidence", "error");
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    showNotification("File max 10MB", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const report = {
      id: Date.now(),
      sender: currentEmail,
      senderName: userDB[currentEmail]?.name || "User",
      type,
      desc,
      media: e.target.result,
      mediaType: file.type.startsWith("video") ? "video" : "image",
      coords: [20.59, 78.96],
      approved: false,
      status: "pending",
      timestamp: new Date().toISOString()
    };

    addItem(
      "reports",
      report,
      () => {
        showSuccess("Report submitted!");
        resetReportForm();
        syncState();
      },
      () => showNotification("Save failed", "error")
    );
  };

  reader.onerror = () => {
    showNotification("File read error", "error");
  };

  reader.readAsDataURL(file);
}

/* ============================
   REPORT ACTIONS
============================ */

function approveReport(id) {
  if (!isLoggedIn() || !hasRole("Admin", "Analyst")) {
    showNotification("Not authorized", "error");
    return;
  }

  getAll("reports", reports => {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    report.approved = true;
    report.approvedBy = currentEmail;
    report.approvedAt = new Date().toISOString();

    updateItem("reports", report, () => {
      showNotification("Report approved", "success");
      syncState();
    });
  });
}

function deleteReport(id) {
  if (!isLoggedIn() || !hasRole("Admin")) {
    showNotification("Admin only", "error");
    return;
  }

  if (!confirm("Delete permanently?")) return;

  deleteItem("reports", id, () => {
    showNotification("Report deleted", "info");
    syncState();
  });
}

/* ============================
   HELPERS
============================ */

function resetReportForm() {
  document.getElementById("hType").value = "";
  document.getElementById("hDesc").value = "";
  document.getElementById("hMedia").value = "";
  document.getElementById("desc-counter").innerText = "0/500";
}
