// Register the service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
  
  // Event listener for the "Get Weather" button
  document.getElementById('get-weather-btn').addEventListener('click', fetchWeather);
  
  async function fetchWeather() {
    const location = document.getElementById('location-input').value.trim();
    const apiKey = '13481752760e499f9b204857241312';  // Replace with your Weather API key
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7`;
  
    try {
      const response = await fetch(forecastUrl);
      if (!response.ok) throw new Error('Error fetching weather data');
      const data = await response.json();
      displayForecast(data);
      saveWeatherData(data); // Save the fetched weather data to the database
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('forecast-container').innerHTML =
        `<p style="color: red;">Could not retrieve forecast for the entered location. Please check the spelling or try a different city.</p>`;
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
  
  // Save the weather data to the SQLite database
  async function saveWeatherData(data) {
    const location = document.getElementById('location-input').value.trim(); // Get the location input
    const weatherData = data.forecast.forecastday.map((day) => ({
      name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }), // Day name
      value: JSON.stringify({
        maxTemp: day.day.maxtemp_c, // Max temperature
        minTemp: day.day.mintemp_c, // Min temperature
        precip: day.day.totalprecip_mm, // Precipitation
        uvIndex: day.day.uv, // UV Index
      }),
    }));
  
    // Send weather data to the backend to be saved in the database
    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, weatherData }), // Send location and weatherData to the server
      });
      
      const result = await response.json(); // Parse the JSON response from the server
  
      // Handle the response based on the server's result
      if (response.ok) {
        alert(result.message || 'Weather data saved successfully');
      } else {
        alert(result.error || 'Failed to save weather data');
      }
    } catch (error) {
      console.error('Error saving weather data:', error); // Log any errors that occur
      alert('Error saving weather data');
    }
  }
  