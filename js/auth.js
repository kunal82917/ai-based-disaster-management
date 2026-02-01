/* ============================
   AUTH STATE
============================ */

let currentEmail = null;
let currentUserRole = null;

/* ============================
   INITIALIZATION
============================ */

document.addEventListener("DOMContentLoaded", () => {
  // Role buttons
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openAuth(btn.dataset.role);
    });
  });

  // Login button
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      processAuth();
    });
  }

  // Close auth modal
  const closeAuth = document.getElementById("close-auth");
  if (closeAuth) {
    closeAuth.addEventListener("click", () => {
      document.getElementById("auth-modal").classList.add("hidden");
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Profile buttons
  const saveProfileBtn = document.getElementById("save-profile-btn");
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      updateProfile();
    });
  }

  const deleteAccountBtn = document.getElementById("delete-account-btn");
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", (e) => {
      e.preventDefault();
      deleteAccount();
    });
  }

  // Success modal close
  const successClose = document.getElementById("success-close");
  if (successClose) {
    successClose.addEventListener("click", closeSuccess);
  }

  // Viewer close
  const viewerClose = document.getElementById("viewer-close");
  if (viewerClose) {
    viewerClose.addEventListener("click", closeViewer);
  }
});

/* ============================
   AUTH FLOW
============================ */

function openAuth(role) {
  if (!role) return console.warn("No role provided");
  currentUserRole = role;
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.remove("hidden");
}

function processAuth() {
  const emailInput = document.getElementById("user-email");
  const passInput = document.getElementById("user-pass");

  if (!emailInput || !passInput) {
    showNotification("Form unavailable", "error");
    return;
  }

  const email = emailInput.value.trim().toLowerCase();
  const pass = passInput.value;

  if (!email || !pass) {
    showNotification("All fields required", "error");
    return;
  }

  if (!email.includes("@")) {
    showNotification("Invalid email", "error");
    return;
  }

  if (!userDB[email]) {
    userDB[email] = {
      pass,
      role: currentUserRole,
      name: "User",
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("ocean_users", JSON.stringify(userDB));
  } else {
    if (userDB[email].pass !== pass) {
      showNotification("Wrong password", "error");
      return;
    }
    if (userDB[email].role !== currentUserRole) {
      showNotification("Role mismatch", "error");
      return;
    }
  }

  currentEmail = email;
  finalizeLogin();
}

function finalizeLogin() {
  document.getElementById("login-overlay").classList.add("hidden");
  document.getElementById("auth-modal").classList.add("hidden");
  document.getElementById("app-root").classList.remove("hidden");

  const emailDisplay = document.getElementById("email-display");
  const roleBadge = document.getElementById("role-badge");

  if (emailDisplay) emailDisplay.innerText = currentEmail;
  if (roleBadge) roleBadge.innerText = currentUserRole;

  updateProfileDisplay();
  initMap();

  if (isDBReady) {
    syncState();
  } else {
    document.addEventListener("dbReady", syncState, { once: true });
  }

  showNotification(`Welcome, ${userDB[currentEmail].name}!`, "success");
}

/* ============================
   PROFILE
============================ */

function updateProfileDisplay() {
  if (!currentEmail || !userDB[currentEmail]) return;

  const emailEl = document.getElementById("profile-email");
  const roleEl = document.getElementById("profile-role");
  const nameInput = document.getElementById("profile-name");

  if (emailEl) emailEl.innerText = currentEmail;
  if (roleEl) roleEl.innerText = currentUserRole;
  if (nameInput) nameInput.value = userDB[currentEmail].name || "";
}

function updateProfile() {
  if (!currentEmail || !userDB[currentEmail]) return;

  const nameInput = document.getElementById("profile-name");
  const newName = nameInput.value.trim();

  if (!newName) {
    showNotification("Name cannot be empty", "error");
    return;
  }

  userDB[currentEmail].name = newName;
  localStorage.setItem("ocean_users", JSON.stringify(userDB));
  showNotification("Profile updated", "success");
}

/* ============================
   HELPERS
============================ */

function isLoggedIn() {
  return Boolean(currentEmail && userDB[currentEmail]);
}

function hasRole(...roles) {
  return roles.includes(currentUserRole);
}

/* ============================
   LOGOUT / DELETE
============================ */

function logout() {
  currentEmail = null;
  currentUserRole = null;
  location.reload();
}

function deleteAccount() {
  if (!currentEmail) return;
  if (!confirm("Delete account permanently?")) return;
  delete userDB[currentEmail];
  localStorage.setItem("ocean_users", JSON.stringify(userDB));
  logout();
}
