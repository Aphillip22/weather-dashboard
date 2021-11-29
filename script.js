//search history
var generateHistory = function() {
    //parse info from localstorage
    var cityHistory = JSON.parse(localStorage.getItem("inputCity"));
    // create a div to act as a container for the old searches
    if (!$(".search-history-container")?.length && cityHistory?.length) {
        $(".city-column").append('<div class="search-history-container pt-4 border-top border-dark"></div>');
    }
    // clear old search history
    $(".search-history-container").html("");
    for (let cityCounter = 0;cityCounter < cityHistory?.length;cityCounter++) {
        let city = cityHistory[cityCounter];
        $(".search-history-container").append(`<button id="CityBtn${cityCounter}" class="btn btn-secondary btn-block">${city}</button>`);
        $(".search-history-container").on("click",`#CityBtn${cityCounter}`, function () {
            createQuery(city);
            console.log(`you clicked ${cityCounter}`)
            localStorage.setItem("city", JSON.stringify(city));
        });
    }
}
//load search history from localstorage
var loadHistory = function() {
    var lastSearched = JSON.parse(localStorage.getItem("inputCity"));
    if (lastSearched?.length > 0) {
    //if last searched in local, pull from local
    let lastCity = lastSearched[lastSearched.length - 1];
    //display most recently searched city on window load, if available
    console.log(lastCity);
    createQuery(lastCity);
    //run search history function to populate sidebar
    generateHistory();
    }
}
//new query API - one day and 5 day
var createQuery = function(city) {
    //get value of input city
    let inputCity = city ? city : $("#citySearch").val();
    //create query to openweather using ajax GET method
    var firstQuery = "https://api.openweathermap.org/data/2.5/weather?q=" + inputCity + "&units=metric&appid=ae091cae15863695a3bd2a2f28f74012";
    $.ajax({
        url: firstQuery,
        method: "GET",
    })
    //then run second query for 1 day data using ajax GET call
    .then(function(data) {
        var secondQuery = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&units=metric&appid=ae091cae15863695a3bd2a2f28f74012";
        $.ajax ({
            url: secondQuery,
            method: "GET",
        })
        //then run uv extended data and include icons & details
        .then(function (uvExtendedData) {
            var weatherIcon = uvExtendedData.current.weather[0].icon;
            var iconUrl = "https://openweathermap.org/img/wn/" + weatherIcon + ".png";
            
            var uviClassName = function (uvi) {
                if (uvi < 4) {
                    return "uv-favorable";
                } else if (uvi >= 4 && uvi <= 10) {
                    return "uv-moderate";
                } else if (uvi > 11) {
                    return "uv-extreme";
                } else {
                    return "uv-undefined";
                }
            };
            
            //include large card for 1 day data
            $(".forecast-column").html("").append('<div class="jumbotron bg-white border border-dark rounded p-3 mt-2 todays-forecast"></div>');
            //include city name with today's date
            $(".todays-forecast").append(`<h7><span class="current-city-date">${moment.unix(uvExtendedData?.current?.dt).format("dddd, MMM Do, YYYY")}</h7><h2 class="current-city">${data.name}</span> <img id="weather-icon" src="${iconUrl}"/></h2>`);
            //include current temperature converted to F
            $(".todays-forecast").append(`<p class="current-temp">Temperature: ${parseInt(uvExtendedData.current.temp * (9 / 5) +
                32) + " &deg;F"}</p>`);
            //include humidity
            $(".todays-forecast").append(`<p class="city-humidity">Humidity: ${parseInt(uvExtendedData.current.humidity) + " %"}</p>`);
            //include wind speed
            $(".todays-forecast").append(`<p class="city-wind">Wind Speed: ${parseInt(uvExtendedData.current.wind_speed) + " MPH"}</p>`);
            //include UV index
            $(".todays-forecast").append(`<p>UV Index: <span class="${uviClassName(uvExtendedData.current.uvi)}">${uvExtendedData.current.uvi}</span></p>`);

            // append divs to container
            $(".forecast-column").append('<div class="future-forecast"></div>');
            $(".future-forecast").append("<h2>5-Day Forecast:</h2>");
            $(".future-forecast").append('<div class="card-deck"></div>');

            // display 5 day forecast for current city with details
            uvExtendedData?.daily?.map((day, index) => {
                //only if index is between 1-5 days
                if (index > 0 && index < 6) {
                    //create card deck and append to html
                    $(".card-deck").append(
                        //small card div including correct date, appropriate icon, temperature converted to F, & humidity
                        `<div class="card px-2 text-white" id="${'card' + index}">
                        <h7 class="card-title">${moment.unix(day.dt).format("M/DD/YYYY")}</h7>
                        <h6 class="card-subtitle"><img id="weatherIcon" src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png"/></h6>
                        <p class="card-text p-0">Temp: ${parseInt(day.temp.day * (9 / 5) +
                            32) + " &deg;F"}</p>
                        <h7 class="card-text">Humidity: ${parseInt(day.humidity) + "%"}</h7>
                        </div>`);
                }
            });
        })
    })
}

var haceclick = function() {
    console.log("click");
}
//search on click and prevent window default
$("#btn-search").on("click", function (event) {
        event.preventDefault();
        //set input to value
        let inputCity = $("#city-search").val();
        //return null alert if input ""
        if (inputCity === "" || inputCity === null){
            alert("Invalid Input");
        }
        //otherwise, create query using city input
        else {
            createQuery(inputCity);
            // get cities from localstorage and create empty array
            var cityArray = JSON.parse(localStorage.getItem("inputCity")) || [];
            // add inputCity to array
            cityArray.push(inputCity);
            // update city array with input city in localstorage
            localStorage.setItem("inputCity", JSON.stringify(cityArray));
            generateHistory(cityArray);
        }
});

//run load history function
loadHistory();