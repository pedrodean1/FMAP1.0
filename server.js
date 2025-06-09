require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.post("/api/search", async (req, res) => {
  const { franchise, city } = req.body;
  const locationRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${API_KEY}`);
  const locationData = await locationRes.json();
  const { lat, lng } = locationData.results[0].geometry.location;

  const placesRes = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&keyword=${encodeURIComponent(franchise)}&key=${API_KEY}`);
  const placesData = await placesRes.json();

  const filtered = [];
  for (const place of placesData.results) {
    const duplicate = filtered.some(p => {
      const dx = p.location.lat - place.geometry.location.lat;
      const dy = p.location.lng - place.geometry.location.lng;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 0.01;
    });
    if (!duplicate) {
      filtered.push({
        name: place.name,
        location: place.geometry.location,
      });
    }
  }

  res.json(filtered);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));