// services/auth.service.js
import { setSession, clearSession } from "../core/state.js";
import { emit } from "../core/events.js";

export function login(email, role) {
  setSession(email, role);
  emit("auth:login", { email, role });
}

export function logout() {
  clearSession();
  emit("auth:logout");
  location.reload();
}

export function hasRole(current, ...roles) {
  return roles.includes(current);
}
