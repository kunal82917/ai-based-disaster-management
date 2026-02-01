// services/reports.service.js
import { emit } from "../core/events.js";
import { addItem, getAll } from "../db/db.js";

export function submitReport(report) {
  addItem("reports", report, () => loadReports());
}

export function loadReports() {
  getAll("reports", reports => {
    emit("reports:updated", { reports });
  });
}
