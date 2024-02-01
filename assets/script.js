var apiKey = "0ba8cf5bfc8f65eb31ed52a9b2605a18";
var savedSearches = [];

var searchHistoryList = function(cityName) {

    var searchHistoryEntry = $("<p>");
    searchHistoryEntry.text(cityName);

    var searchEntryContainer = $("<div>");
    searchEntryContainer.addClass("past-search-container");

    searchEntryContainer.append(searchHistoryEntry);

    var searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(searchEntryContainer);

    if (savedSearches.length > 0){
        var previousSavedSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(previousSavedSearches);
    }

    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

    $("#searched-city").val("");

};

var loadSearchHistory = function() {
    var savedSearchHistory = localStorage.getItem("savedSearches");

    if (!savedSearchHistory) {
        return false;
    }

    savedSearchHistory = JSON.parse(savedSearchHistory);

    for (var i = 0; i < savedSearchHistory.length; i++) {
        searchHistoryList(savedSearchHistory[i]);
    }
};

var currentWeatherSection = function(cityName) {
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`)

        .then(function(response) {
            return response.json();
        })
        
        .then(function(response) {
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&appid=${apiKey}&units=imperial`)

                .then(function(response) {
                    return response.json();
                })
                
                .then(function(response){
                    searchHistoryList(cityName);

                    var currentWeatherContainer = $("#current-weather-container");
                    currentWeatherContainer.addClass("current-weather-container");

                    var currentTitle = $("#current-title");
                    var currentDay = dayjs().format("M/D/YYYY");
                    currentTitle.text(`${cityName} ${currentDay}`);
                    var currentIcon = $("#current-weather-icon");
                    currentIcon.addClass("current-weather-icon");
                    var currentIconCode = response.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

                    var currentTemperature = $("#current-temperature");
                    currentTemperature.text("Temperature: " + response.main.temp + " \u00B0F");

                    var currentHumidity = $("#current-humidity");
                    currentHumidity.text("Humidity: " + response.main.humidity + "%");

                    var currentWindSpeed = $("#current-wind-speed");
                    currentWindSpeed.text("Wind Speed: " + response.wind.speed + " MPH");

                })

        })
};

var fiveDayForecastSection = function(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`)
        
        .then(function(response) {
            return response.json();
            
        })
        .then(function(response) {
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${cityLat}&lon=${cityLon}&appid=${apiKey}&units=imperial`)
                
                .then(function(response) {
                    return response.json();
                })

                .then(function(response) {
                    
                    var uniqueForecastDays = [];
                    var fiveDaysForecast = response.list.filter(function(forecast){
                        var forecastDateTime = new Date(forecast.dt_txt);
                        var forecastDate = forecastDateTime.getDate();
                        var forecastTime = forecastDateTime.getHours();

                        if(!uniqueForecastDays.includes(forecastDate) && forecastTime === 15) {
                            return uniqueForecastDays.push(forecastDate);
                        } 
                    });

                    var forecastTitle = $("#forecast-title");
                    forecastTitle.text("5-Day Forecast:")

                    var forecastCard = $("#forecast-container");
                    forecastCard.addClass("forecast-container");
                    
                    for (var i = 0; i <= fiveDaysForecast.length; i++) {
                        var forecastCard = $(".forecast-card");
                        forecastCard.addClass("forecast-card-details");

                        var fiveDayForecastDate = $("#forecast-date-" + i);
                        date = dayjs().add(i, "d").format("M/D/YYYY");
                        fiveDayForecastDate.text(date);

                        if (fiveDaysForecast[i] && fiveDaysForecast[i].weather && fiveDaysForecast[i].weather[0]) {
                        var forecastIcon = $("#forecast-icon-" + (i + 1));
                        forecastIcon.addClass("forecast-icon");
                        var forecastIconCode = fiveDaysForecast[i].weather[0].icon;
                        forecastIcon.attr("src", `https://openweathermap.org/img/wn/${forecastIconCode}@2x.png`);

                        var forecastTemp = $("#forecast-temp-" + (i + 1));
                        forecastTemp.text("Temp: " + fiveDaysForecast[i].main.temp + " \u00B0F");

                        var forecastWind = $("#forecast-wind-" + (i + 1));
                        forecastWind.text("Wind Speed: " + fiveDaysForecast[i].wind.speed + "MPH");

                        var forecastHumidity = $("#forecast-humidity-" + (i + 1));
                        forecastHumidity.text("Humidity: " + fiveDaysForecast[i].main.humidity + "%");
                        }
                    }
                })
       
        });
};

$("#search-input").on("submit", function(event) {
    event.preventDefault();
    
    var cityName = $("#searched-city").val();

        currentWeatherSection(cityName);
        fiveDayForecastSection(cityName);
    
});

$("#search-history-container").on("click", "p", function() {
    var previousCityName = $(this).text();
    currentWeatherSection(previousCityName);
    fiveDayForecastSection(previousCityName);

    var previousCityClicked = $(this);
    previousCityClicked.remove();
});

loadSearchHistory();
