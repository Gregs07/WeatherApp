document.addEventListener('DOMContentLoaded', () => {
  // Register the Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  } else {
    console.log('Service workers are not supported in this browser');
  }

  // Event listener to handle the "Get Weather" button click
  document.getElementById('get-weather-btn').addEventListener('click', fetchWeather);
});

const apiKey = '13481752760e499f9b204857241312'; // Replace with your actual WeatherAPI key

async function fetchWeather() {
  const location = document.getElementById('location-input').value.trim();
  if (!location) {
    alert("Please enter a location.");
    return;
  }

  try {
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7`);
    const result = await response.json();

    if (response.ok) {
      // Cache the weather data for offline access
      await cacheWeatherData(location, result);
      displayForecast(result);
    } else {
      alert(result.error?.message || 'Failed to fetch weather data');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error fetching weather data');
  }
}

// Cache weather data in the service worker
async function cacheWeatherData(location, data) {
  if ('caches' in window) {
    const cache = await caches.open('weather-cache');
    const cachedData = {
      location,
      data,
      timestamp: new Date().toISOString(),
    };
    await cache.put(location, new Response(JSON.stringify(cachedData)));
    console.log(`Weather data for ${location} cached at ${new Date().toISOString()}`);
  }
}

// Load weather data from cache (if available)
async function loadWeatherData() {
  const location = document.getElementById('location-input').value.trim();
  if (!location) return;

  try {
    const cache = await caches.open('weather-cache');
    const cachedResponse = await cache.match(location);

    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      console.log('Loaded from cache:', cachedData);
      displayForecast(cachedData.data);
    } else {
      console.log('No cache found for location:', location);
    }
  } catch (error) {
    console.error('Error loading weather data from cache:', error);
  }
}

function displayForecast(data) {
  const forecastContainer = document.getElementById('forecast-container');
  forecastContainer.innerHTML = ''; // Clear previous results

  data.forecast.forecastday.forEach((day) => {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('forecast-day');
    dayDiv.innerHTML = `
      <h3>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</h3>
      <p>High: ${day.day.maxtemp_c}°C</p>
      <p>Low: ${day.day.mintemp_c}°C</p>
      <p>Precip: ${day.day.totalprecip_mm}mm</p>
    `;
    dayDiv.addEventListener('click', () => displayDailyGraph(day));
    forecastContainer.appendChild(dayDiv);
  });
}

function displayDailyGraph(day) {
  const canvas = document.getElementById('daily-graph');
  const ctx = canvas.getContext('2d');

  // Destroy any existing chart to avoid overlapping
  if (window.myChart) window.myChart.destroy();

  // Extract hourly data
  const hours = day.hour.map((h) => h.time.split(' ')[1]);
  const temps = day.hour.map((h) => h.temp_c);
  const uv = day.hour.map((h) => h.uv);

  // Create new chart
  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temps,
          borderColor: '#007bff',
          fill: false,
        },
        {
          label: 'UV Index',
          data: uv,
          borderColor: '#ff7f00',
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
      },
      scales: {
        x: { title: { display: true, text: 'Hour' } },
        y: { title: { display: true, text: 'Value' } },
      },
    },
  });
}
