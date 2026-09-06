

// ========================================
// API KEY
// ========================================



// ========================================
// GLOBAL VARIABLES
// ========================================

let currentCity = "";
let debounceTimer;


// ========================================
// GET CURRENT WEATHER
// ========================================
async function getWeather(city) {

    try {

       const url = `/api/weather?city=${encodeURIComponent(city)}`;

        const response = await fetch(url);

        if (!response.ok) {

            const errorData = await response.json();

            console.log("API ERROR:", errorData);

            throw new Error(errorData.message);
        }

        const data = await response.json();

        console.log("Weather Data:", data);

        return {

            city: data.name,

            temp: Math.round(data.main.temp),

            feelsLike: Math.round(data.main.feels_like),

            description: data.weather[0].description,

            humidity: data.main.humidity,

            windSpeed: data.wind.speed,

            icon: data.weather[0].icon

        };

    } catch (error) {

        throw error;

    }
}


document
    .getElementById("locationBtn")
    .addEventListener("click", getCurrentLocation);

function getCurrentLocation() {

    if (!navigator.geolocation) {

        showError("Geolocation is not supported by your browser.");

        return;
    }

    document.getElementById("loading").style.display = "block";

    navigator.geolocation.getCurrentPosition(
        async function(position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {

               const url =
    `/api/weather/location?lat=${latitude}&lon=${longitude}`;

                const response = await fetch(url);

                if (!response.ok) {

                    const errorData = await response.json();

                    throw new Error(errorData.message);
                }

                const data = await response.json();

                const weather = {

                    city: data.name,

                    temp: Math.round(data.main.temp),

                    feelsLike:
                        Math.round(data.main.feels_like),

                    description:
                        data.weather[0].description,

                    humidity:
                        data.main.humidity,

                    windSpeed:
                        data.wind.speed,

                    sunrise:
                        data.sys.sunrise,

                    sunset:
                        data.sys.sunset
                };

                displayWeather(weather);

                // Get forecast using city name
                const forecast =
                    await getForecast(data.name);

                displayForecast(forecast);

            } catch (error) {

                showError(error.message);

            } finally {

                document.getElementById("loading")
                    .style.display = "none";
            }
        },

        function(error) {

            document.getElementById("loading")
                .style.display = "none";

            showError(
                "Unable to get your location."
            );
        }
    );
}


// ========================================
// GET date and time
// =======================================
function formatTime(timestamp) {

    const date = new Date(timestamp * 1000);

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function updateDateTime() {

    const now = new Date();

    const date = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    document.getElementById("currentDate").textContent = date;

    document.getElementById("currentTime").textContent = time;
}


// Run immediately
updateDateTime();


// Update every 1 second
setInterval(updateDateTime, 1000);

// ========================================
// GET 5 DAY FORECAST
// ========================================

async function getForecast(city) {

    try {

       const url = `/api/forecast?city=${encodeURIComponent(city)}`;

        const response = await fetch(url);

        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(errorData.message);
        }

        const data = await response.json();

        console.log("Forecast Data:", data);

        return data;

    } catch (error) {

        throw error;

    }
}


// ========================================
// DISPLAY CURRENT WEATHER
// ========================================

function displayWeather(weather) {

    document.getElementById("weatherCard").style.display = "block";

    document.getElementById("cityName").textContent =
        `📍 ${weather.city}`;

    document.getElementById("temperature").textContent =
        weather.temp;

    document.getElementById("description").textContent =
        weather.description;

    document.getElementById("feelsLike").textContent =
        weather.feelsLike;

    document.getElementById("humidity").textContent =
        weather.humidity;

    document.getElementById("windSpeed").textContent =
        weather.windSpeed;

    document.getElementById("sunrise").textContent =
    formatTime(weather.sunrise);

    document.getElementById("sunset").textContent =
    formatTime(weather.sunset);    

    currentCity = weather.city;
}


// ========================================
// DISPLAY FORECAST
// ========================================

function displayForecast(data) {

    const forecastSection =
        document.getElementById("forecastSection");

    const forecastContainer =
        document.getElementById("forecastContainer");

    forecastContainer.innerHTML = "";

    forecastSection.style.display = "block";


    // API gives weather every 3 hours.
    // We select one item for each day.

    const dailyForecast = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );


    dailyForecast.slice(0, 5).forEach(item => {

        const date = new Date(item.dt * 1000);

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });


        const temp = Math.round(item.main.temp);

        const description =
            item.weather[0].description;


        const icon =
            item.weather[0].icon;


        const card =
            document.createElement("div");

        card.className = "forecast-card";


        card.innerHTML = `

            <h3>${day}</h3>

            <img
                src="https://openweathermap.org/img/wn/${icon}@2x.png"
                alt="${description}"
            >

            <p class="forecast-temp">
                ${temp}°C
            </p>

            <p>
                ${description}
            </p>

        `;


        forecastContainer.appendChild(card);

    });

}


// ========================================
// SEARCH WEATHER
// ========================================

async function searchWeather(city) {

    if (!city) {

        city =
            document.getElementById("cityInput")
                .value
                .trim();

    }


    if (city === "") {

        showError("Please enter a city name.");

        return;

    }


    // Show loading

    document.getElementById("loading")
        .style.display = "block";


    // Hide old error

    document.getElementById("errorMsg")
        .style.display = "none";


    try {

        // Get current weather

        const weather =
            await getWeather(city);


        // Get forecast

        const forecast =
            await getForecast(city);


        // Display current weather

        displayWeather(weather);


        // Display forecast

        displayForecast(forecast);


    } catch (error) {

        showError(error.message);

    } finally {

        // Hide loading

        document.getElementById("loading")
            .style.display = "none";

    }

}


// ========================================
// SHOW ERROR
// ========================================

function showError(message) {

    const errorMsg =
        document.getElementById("errorMsg");


    errorMsg.textContent =
        `❌ ${message}`;


    errorMsg.style.display =
        "block";


    document.getElementById("weatherCard")
        .style.display = "none";


    document.getElementById("forecastSection")
        .style.display = "none";

}


// ========================================
// ADD FAVORITE
// ========================================

function addFavorite(city) {

    let favorites =
        JSON.parse(
            localStorage.getItem("favorites")
        ) || [];


    // Check duplicate

    if (favorites.includes(city)) {

        alert("City already exists in favorites!");

        return;

    }


    // Add city

    favorites.push(city);


    // Save

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );


    // Display

    loadFavorites();

}


// ========================================
// LOAD FAVORITES
// ========================================

function loadFavorites() {

    const favorites =
        JSON.parse(
            localStorage.getItem("favorites")
        ) || [];


    const favoritesList =
        document.getElementById("favoritesList");


    favoritesList.innerHTML = "";


    favorites.forEach(city => {

        const item =
            document.createElement("div");


        item.className =
            "favorite-item";


        item.innerHTML = `

            <span
                class="favorite-city"
                onclick="searchWeather('${city}')"
                style="cursor:pointer"
            >
                ⭐ ${city}
            </span>

            <button
                onclick="removeFavorite('${city}')"
            >
                ❌
            </button>

        `;


        favoritesList.appendChild(item);

    });

}


// ========================================
// REMOVE FAVORITE
// ========================================

function removeFavorite(city) {

    let favorites =
        JSON.parse(
            localStorage.getItem("favorites")
        ) || [];


    favorites =
        favorites.filter(
            favorite => favorite !== city
        );


    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );


    loadFavorites();

}


// ========================================
// DEBOUNCE SEARCH
// ========================================

function debounceSearch() {

    clearTimeout(debounceTimer);


    debounceTimer =
        setTimeout(() => {

            const city =
                document.getElementById("cityInput")
                    .value
                    .trim();


            if (city !== "") {

                searchWeather(city);

            }

        }, 500);

}


// ========================================
// SEARCH BUTTON
// ========================================

document
    .getElementById("searchBtn")
    .addEventListener("click", () => {

        searchWeather();

    });


// ========================================
// INPUT DEBOUNCE
// ========================================

document
    .getElementById("cityInput")
    .addEventListener("input", () => {

        debounceSearch();

    });


// ========================================
// ENTER KEY
// ========================================

document
    .getElementById("cityInput")
    .addEventListener("keydown", event => {

        if (event.key === "Enter") {

            clearTimeout(debounceTimer);

            searchWeather();

        }

    });


// ========================================
// ADD FAVORITE BUTTON
// ========================================

document
    .getElementById("favoriteBtn")
    .addEventListener("click", () => {

        if (currentCity !== "") {

            addFavorite(currentCity);

        }

    });


// ========================================
// DARK / LIGHT MODE
// ========================================

document
    .getElementById("themeBtn")
    .addEventListener("click", function () {

        document.body.classList.toggle("dark");


        if (
            document.body.classList.contains("dark")
        ) {

            this.textContent = "☀️ Light";

        } else {

            this.textContent = "🌙 Dark";

        }

    });


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadFavorites();

    }
);
