const cityInput = document.querySelector('.city-input')
const searchBtn = document.querySelector('.search-btn')

const weatherInfoSection = document.querySelector('.weather-info')
const notFoundSection = document.querySelector('.not-found')
const searchCitySection = document.querySelector('.search-city')

const countryTxt = document.querySelector('.country-txt')
const tempTxt = document.querySelector('.temp-txt')
const conditionTxt = document.querySelector('.condition-txt')
const elevationValueTxt = document.querySelector('.elevation-value-txt')
const windValueTxt = document.querySelector('.wind-value-txt')
const weatherSummaryImg = document.querySelector('.weather-summary-img')
const currentDateTxt = document.querySelector('.current-date-txt')
const forecastItemsContainer = document.querySelector('.forecast-items-container')

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' &&
        cityInput.value.trim() != ''
    ) {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

async function getCoordinates(city) {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) return null;
    
    return {
        name: data.results[0].name,
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
    };
}

async function getWeatherForecast(lat, lon) {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
    );
    return response.json();
}

const UNSPLASH_ACCESS_KEY = '0dUmPOoRvaIXRk1zNB2Dvm7JHw4uYGTsW46ZoJRHli0';

async function updateBackgroundImage(city) {
    const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(city)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    const data = await response.json();
    if (data && data.urls && data.urls.full) {
        document.body.style.background = `url(${data.urls.full})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }
}

function getWeatherIcon(code) {
    if (code === 0) return 'clear.svg';
    if ([1, 2, 3].includes(code)) return 'clouds.svg';
    if ([45, 48].includes(code)) return 'fog.svg';
    if ([51, 53, 55].includes(code)) return 'drizzle.svg';
    if ([56, 57].includes(code)) return 'freezing-drizzle.svg';
    if ([61, 63, 65].includes(code)) return 'rain.svg';
    if ([66, 67].includes(code)) return 'freezing-rain.svg';
    if ([71, 73, 75].includes(code)) return 'snow.svg';
    if (code === 77) return 'snow-grains.svg';
    if ([80, 81, 82].includes(code)) return 'rain-showers.svg';
    if ([85, 86].includes(code)) return 'snow-showers.svg';
    if (code === 95) return 'thunderstorm.svg';
    if ([96, 99].includes(code)) return 'hail-thunderstorm.svg';

    return 'unknown.svg';
}

function getConditionFromCode(code) {
    if (code === 0) return 'Clear sky';
    if ([1, 2, 3].includes(code)) return 'Mainly clear, partly cloudy, or overcast';
    if ([45, 48].includes(code)) return 'Fog and depositing rime fog';
    if ([51, 53, 55].includes(code)) return 'Drizzle: Light, moderate, or dense';
    if ([56, 57].includes(code)) return 'Freezing Drizzle: Light or dense';
    if ([61, 63, 65].includes(code)) return 'Rain: Slight, moderate, or heavy';
    if ([66, 67].includes(code)) return 'Freezing Rain: Light or heavy';
    if ([71, 73, 75].includes(code)) return 'Snowfall: Slight, moderate, or heavy';
    if (code === 77) return 'Snow grains';
    if ([80, 81, 82].includes(code)) return 'Rain showers: Slight, moderate, or violent';
    if ([85, 86].includes(code)) return 'Snow showers: Slight or heavy';
    if (code === 95) return 'Thunderstorm: Slight or moderate';
    if ([96, 99].includes(code)) return 'Thunderstorm with hail';

    return 'Unknown weather condition';
}

function getCurrentDate() {
    const currentDate = new Date()
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    
    return currentDate.toLocaleDateString('en-GB', options)
}

async function updateWeatherInfo(city) {
    const location = await getCoordinates(city);
    if (!location) {
        showDisplaySection(notFoundSection);
        return;
    }

    const weatherData = await getWeatherForecast(location.latitude, location.longitude);
    console.log(location.name) 
    await updateBackgroundImage(location.name); // dynamically load the bg

    const current = weatherData.current;
    const daily = weatherData.daily;

    countryTxt.textContent = location.name;
    tempTxt.textContent = `${Math.round(current.temperature_2m)} °C`;
    conditionTxt.textContent = getConditionFromCode(current.weather_code);
    elevationValueTxt.textContent = `${weatherData.elevation} m`;
    windValueTxt.textContent = `${current.wind_speed_10m} m/s`;
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(current.weather_code)}`;

    updateForecastsInfo(daily);
    showDisplaySection(weatherInfoSection);
}

function updateForecastsInfo(daily) {
    forecastItemsContainer.innerHTML = '';

    for (let i = 0; i < daily.time.length - 1; i++) {
        const date = daily.time[i];
        const icon = getWeatherIcon(daily.weather_code[i]);
        const temp = daily.temperature_2m_max[i];

        const dateTaken = new Date(date);
        const dateResult = dateTaken.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short'
        });

        const forecastItem = `
            <div class="forecast-item">
                <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
                <img src="assets/weather/${icon}" class="forecast-item-img">
                <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
            </div>
        `;
        forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
    }
}

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData

    const dateTaken = new Date(date)
    const dateOption = {
        day: '2-digit',
        month: 'short'
    }
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption)

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem)
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none')

    section.style.display = 'flex'
}