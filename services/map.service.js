// services/map.service.js
let map;
let markers = [];

export function ensureMap() {
  if (map) return;
  map = L.map("map").setView([20.59, 78.96], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
}

export function updateMap(reports = []) {
  if (!map) return;

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  reports.forEach(r => {
    if (!r.coords) return;
    const marker = L.circleMarker(r.coords).addTo(map);
    markers.push(marker);
  });
}
