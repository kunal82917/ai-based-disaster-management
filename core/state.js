// core/state.js
export const state = {
  session: {
    email: null,
    role: null
  },
  reports: [],
  alerts: []
};

export function setSession(email, role) {
  state.session.email = email;
  state.session.role = role;
  localStorage.setItem("session", JSON.stringify(state.session));
}

export function clearSession() {
  state.session.email = null;
  state.session.role = null;
  localStorage.removeItem("session");
}

export function restoreSession() {
  const saved = JSON.parse(localStorage.getItem("session"));
  if (saved?.email && saved?.role) {
    state.session = saved;
    return true;
  }
  return false;
}
