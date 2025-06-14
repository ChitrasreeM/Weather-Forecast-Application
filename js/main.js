// Load city coordinates and populate dropdown
fetch('city_coordinates.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(cities => {
    console.log("Loaded cities:", cities); // For debugging
    const citySelect = document.getElementById('citySelect');

    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = `${city.lat},${city.lon}`;
      option.textContent = `${city.city}, ${city.country}`;
      citySelect.appendChild(option);
    });

    citySelect.addEventListener('change', function () {
      const [lat, lon] = this.value.split(',');
      if (lat && lon) fetchWeather(lat, lon);
    });
  })
  .catch(error => {
    console.error('Failed to load city list:', error);
    document.getElementById('weatherOutput').textContent = 'Failed to load city data.';
  });

// Fetch weather data from API
function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
  console.log("Fetching URL:", url);

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log("Weather data received:", data);
      displayWeather(data);
    })
    .catch(error => {
      console.error("Weather API error:", error);
      document.getElementById('weatherOutput').textContent = 'Failed to load weather data.';
    });
}
function getBackgroundClass(code) {
  if ([0].includes(code)) return "clear-bg";
  if ([1, 2].includes(code)) return "partlycloudy-bg";
  if ([3].includes(code)) return "cloudy-bg";
  if ([45, 48].includes(code)) return "foggy-bg";
  if ([51, 53, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rainy-bg";
  if ([71, 73, 75, 77].includes(code)) return "snowy-bg";
  if ([95, 96, 99].includes(code)) return "stormy-bg";
  return "default-bg";
}


// Map weather codes to icons
function getIconFilename(code) {
  const map = {
    0: "clear", 1: "pcloudy", 2: "mcloudy", 3: "cloudy",
    45: "fog", 48: "fog", 51: "lightrain", 53: "lightrain",
    61: "rain", 63: "rain", 65: "rain", 66: "rain", 67: "rain",
    71: "snow", 73: "snow", 75: "snow", 77: "snow",
    80: "rain", 81: "rain", 82: "rain", 95: "tstorm",
    96: "tstorm", 99: "tstorm"
  };
  return map[code] || "cloudy";
}

// Display 3-day weather forecast
function displayWeather(data) {
    // Set background based on Day 1 weather
const code = data.daily.weathercode[0];
const bgClass = getBackgroundClass(code);

// Remove old background class
document.body.className = document.body.className
  .split(" ")
  .filter(c => !c.endsWith("-bg"))
  .join(" ")
  .trim();

// Add the new background class
document.body.classList.add(bgClass);

  const outputDiv = document.getElementById('weatherOutput');
  outputDiv.innerHTML = ''; // Clear previous

  if (!data.daily || !data.daily.time) {
    outputDiv.textContent = 'No weather data available.';
    return;
  }

  for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
    const date = new Date(data.daily.time[i]).toDateString();
    const code = data.daily.weathercode[i];
    const maxTemp = data.daily.temperature_2m_max[i];
    const minTemp = data.daily.temperature_2m_min[i];
    const iconName = getIconFilename(code);

    const container = document.createElement('div');
    container.style.margin = '10px 0';

    const icon = document.createElement('img');
    icon.src = `images/${iconName}.png`;
    icon.alt = iconName;
    icon.width = 50;
    icon.height = 50;
    icon.style.verticalAlign = 'middle';

    const info = document.createElement('span');
    info.innerHTML = `<strong>${date}</strong>: ${iconName}, Max: ${maxTemp}°C, Min: ${minTemp}°C`;

    container.appendChild(icon);
    container.appendChild(info);
    outputDiv.appendChild(container);
  }
}
