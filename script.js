let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.7617, lng: -80.1918 },
    zoom: 12,
  });
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const franchise = document.getElementById("franchise").value;
  const city = document.getElementById("city").value;
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ franchise, city }),
  });
  const data = await res.json();
  markers.forEach(m => m.setMap(null));
  markers = [];
  data.forEach(place => {
    const marker = new google.maps.Marker({
      position: place.location,
      map,
      title: place.name
    });
    markers.push(marker);
  });
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const rows = markers.map(m => [m.getTitle(), m.getPosition().lat(), m.getPosition().lng()]);
  let csv = "Name,Latitude,Longitude\n";
  rows.forEach(r => csv += r.join(",") + "\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "results.csv";
  a.click();
});