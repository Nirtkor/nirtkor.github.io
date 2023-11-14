
async function getLocation(cityInput) {
    const yandexApiKey = "d154faf6-e96b-460a-ae6b-1bb395de5c05";
    const yandexApiUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&geocode=${encodeURIComponent(cityInput)}&format=json`;

    try {
        const response = await fetch(yandexApiUrl);
        const data = await response.json();

        const featureMember = data.response.GeoObjectCollection.featureMember;
        if (!featureMember || featureMember.length === 0) {
            throw new Error('Город не найден');
        }

        const coordinates = featureMember[0].GeoObject.Point.pos.split(" ");
        const latitude = coordinates[1];
        const longitude = coordinates[0];

        return [latitude, longitude];
    } catch (error) {
        console.error("Ошибка при выполнении запроса:", error);
        throw error;
    }
}

async function fetchWeather(latitude, longitude) {
    const openWeatherApiKey = '7355e2997f7921df8c644b7fe131e132';
    const openWeatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    try {
        const response = await fetch(`${openWeatherApiUrl}?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`);
        const data = await response.json();

        if (data.cod && data.cod !== 200) {
            throw new Error(`Ошибка OpenWeather API: ${data.message}`);
        }

        displayWeather(data);
    } catch (error) {
        console.error("Ошибка при получении данных о погоде:", error);
        throw error;
    }
}

function displayWeather(data) {
    const weatherContainer = document.getElementById('weather-container');

    if (!weatherContainer) {
        console.error("Элемент 'weather-container' не найден на странице.");
        return;
    }

    const cityName = data.name;
    const temperature = Math.round(data.main.temp - 273.15);
    const feels_like = Math.round(data.main.feels_like - 273.15);
    const sunriseDate = (new Date(data.sys.sunrise * 1000)).toLocaleTimeString('ru-RU', { timeStyle: 'short' });
    const sunsetDate = (new Date(data.sys.sunset * 1000)).toLocaleTimeString('ru-RU', { timeStyle: 'short' });
    const weatherDescription = data.weather[0].description;
    const act_date = (new Date(data.dt * 1000)).toLocaleTimeString('ru-RU', { timeStyle: 'short' });

    const weatherHTML = `
        <h2>${cityName}</h2>
        <p>Температура: ${temperature}°C</p>
        <p>Ощущается как: ${feels_like}°C</p>
        <p>Погода: ${weatherDescription}</p>
        <p>Время восхода: ${sunriseDate}</p>
        <p>Время заката: ${sunsetDate}</p>
        <p>Данные актуальны на: ${act_date}</p>
    `;

    weatherContainer.innerHTML = weatherHTML;
}


async function getWeather() {
    const cityInput = document.getElementById('cityInput').value;
    try {
        const [latitude, longitude] = await getLocation(cityInput);
        await fetchWeather(latitude, longitude);

        localStorage.setItem('selectedCity', cityInput);

        window.location.href = 'weather.html';
    } catch (error) {
        console.error("Произошла ошибка:", error);
        alert("Произошла ошибка. Пожалуйста, проверьте введенный город.");
    }
}


async function getWeatherForCity(city) {
    try {
        const [latitude, longitude] = await getLocation(city);
        await fetchWeather(latitude, longitude);
    } catch (error) {
        console.error("Произошла ошибка:", error);
        alert("Произошла ошибка при загрузке погоды.");
    }
}
