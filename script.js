// 🌍 Initialize Leaflet Map
const map = L.map('map').setView([-1.286389, 36.817223], 13); // Nairobi

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 💬 Chat Handling
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatWindow = document.getElementById("chat-window");

// 🗺️ Marker Store
const markers = new Map();

// 🧪 MOCK: Sample restaurant POI data (✅ REMOVE WHEN BACKEND RETURNS REAL COORDS)
const mockPlaces = [
  { name: "Carnivore Restaurant", lat: -1.3191, lon: 36.8155 },
  { name: "Talisman Restaurant", lat: -1.3377, lon: 36.7113 },
  { name: "Nyama Mama", lat: -1.2854, lon: 36.8190 },
  { name: "J's Fresh Bar and Kitchen", lat: -1.2985, lon: 36.7794 },
  { name: "88 Restaurant", lat: -1.2706, lon: 36.8128 }
];

// 🧩 Append chat message
function appendMessage(content, type = "system") {
  const msg = document.createElement("div");
  msg.classList.add("message", type);

  if (type === "system" && content === "[MOCK_POIS]") {
    mockPlaces.forEach((place, index) => {
      const marker = L.marker([place.lat, place.lon])
        .bindPopup(`<b>${place.name}</b>`)
        .addTo(map);
      markers.set(place.name, marker);

      const span = document.createElement("span");
      span.className = "poi";
      span.dataset.name = place.name;
      span.innerText = `${index + 1}. ${place.name} 📍`;
      span.style.cursor = "pointer";
      span.style.display = "block";
      span.style.color = "#00ffaa";
      span.style.marginBottom = "6px";

      span.onclick = () => focusOnPOI(place.name);
      msg.appendChild(span);
    });
  } else {
    msg.innerText = content;
  }

  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 🎯 Focus on a specific marker and hide others
function focusOnPOI(name) {
  markers.forEach((marker, markerName) => {
    if (markerName === name) {
      marker.addTo(map);
      map.setView(marker.getLatLng(), 16);
      marker.openPopup();
    } else {
      map.removeLayer(marker);
    }
  });
}

// 🔄 Reset markers (optional)
function resetMarkers() {
  markers.forEach(marker => map.addLayer(marker));
}

// 🧠 Handle form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMsg = input.value.trim();
  if (!userMsg) return;

  appendMessage(userMsg, "user");
  input.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg })
    });

    const data = await res.json();

    if (data.reply) {
      appendMessage(data.reply, "system");

      // 🔁 TEMP LOGIC — show mock markers if topic is restaurants (✅ REMOVE WHEN LIVE)
      if (userMsg.toLowerCase().includes("restaurant") || userMsg.toLowerCase().includes("eat")) {
        appendMessage("[MOCK_POIS]", "system");
      }

    } else {
      appendMessage("⚠️ No response from Explorer.", "system");
    }
  } catch (err) {
    console.error(err);
    appendMessage("⚠️ Error reaching Explorer backend.", "system");
  }
});
