document.addEventListener("DOMContentLoaded", () => {
  // Initialize the map
  const map = L.map("map", { zoomControl: true }).setView([20, 0], 2);

  // Add OpenStreetMap base layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  // OpenWeatherMap API key
  const apiKey = "ff76e1bccad56c0c2dc5b159cf4b38a4";

  // Add temperature overlay
  const tempLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, 
    { opacity: 0.5, attribution: 'Weather data © OpenWeatherMap' }
  );

  // Add precipitation overlay
  const precipLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`,
    { opacity: 0.5, attribution: 'Weather data © OpenWeatherMap' }
  );

  // Add wind speed overlay
  const windLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`,
    { opacity: 0.5, attribution: 'Weather data © OpenWeatherMap' }
  );

  // Add layers control
  const overlayMaps = {
    "Temperature": tempLayer,
    "Precipitation": precipLayer,
    "Wind Speed": windLayer,
  };

  L.control.layers(null, overlayMaps).addTo(map);

  // Default overlay
  tempLayer.addTo(map);
});
