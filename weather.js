// Define the map and initialize variables
var map = L.map('map').setView([51.505, -0.09], 13);
var marker;
var openWeatherKey = 'YOUR-OPENWEATHER-APIKEY';
var openCageKey = 'YOUR-OPENCAGE-APIKEY';

// Add the tile layer to the map

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// Add a click event listener to the map


map.on('click', function (e) {
    placeMarker(e.latlng);
    getWeather(e.latlng.lat, e.latlng.lng);
});

// Add a click event listener to the search button

document.getElementById('searchBtn').addEventListener('click', function () {
    geocodeAddress();
});

// Function to place a marker on the map


function placeMarker(latLng) {
    if (marker) {
        marker.remove();
    }
    marker = L.marker(latLng).addTo(map);
    map.panTo(latLng);
}

// Function to get the weather information for a location


function getWeather(lat, lng) {
    var url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&lang=en&appid=${openWeatherKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            var temp = Math.round(data.main.temp);
            marker.bindPopup(`${temp}&#8451;`).openPopup();
        });
}
// Function to geocode an address and place a marker on the map


function geocodeAddress() {
    var address = document.getElementById('location').value;
    if (!address) {
        alert('Please enter a location');
        return;
    }
    var url = `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=${openCageKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results.length === 1) {
                var lat = data.results[0].geometry.lat;
                var lng = data.results[0].geometry.lng;
                var latLng = L.latLng(lat, lng);
                placeMarker(latLng);
                getWeather(lat, lng);
            }
            else if (data.results.length === 0) {
                alert('Address not found');
            }


            else {
                if (document.getElementById('locations')) {
                    document.getElementById('locations').remove();
                }

                // Create new select element and populate it with the results


                var select = document.createElement('select');
                select.setAttribute('id', 'locations');
                data.results.forEach(result => {
                    var option = document.createElement('option');
                    option.value = result.formatted;
                    option.textContent = result.formatted;
                    select.appendChild(option);
                });
                searchDiv = document.getElementById('search');

                // Remove any existing select elements
                var existingSelect = searchDiv.querySelector('select');
                if (existingSelect) {
                    searchDiv.removeChild(existingSelect);
                }

                // Add new select element to search div
                searchDiv.appendChild(select);
                select.addEventListener('change', function () {
                    var index = this.selectedIndex;
                    var lat = data.results[index].geometry.lat;
                    var lng = data.results[index].geometry.lng;
                    var latLng = L.latLng(lat, lng);
                    placeMarker(latLng);
                    getWeather(lat, lng);
                });

            }
        });
}