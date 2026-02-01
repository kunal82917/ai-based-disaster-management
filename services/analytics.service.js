// services/analytics.service.js
export function renderAnalytics(reports = []) {
  const el = document.getElementById("analysis-content");
  if (!el) return;

  const total = reports.length;
  el.innerHTML = `<h3>Total Reports: ${total}</h3>`;
}
