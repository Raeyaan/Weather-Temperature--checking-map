
//(); Define the map and initialize variables
let map = L.map('map').setView([51.505, -0.09], 13);
let marker;
const myIcon = L.icon({
    iconUrl: 'myIcon.png',
    // ...
 });

const openWeatherKey = '4b9aec12b64457eb5f23f987d32c4314';
const openCageKey = 'e1cb51095a4d4ae5992fcdeaedddcdf3';

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

// Add a key down event listener to the search button

document.getElementById('location').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') { 
        geocodeAddress();
    }
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
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&lang=en&appid=${openWeatherKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let temp = Math.round(data.main.temp);
            marker.bindPopup(`${temp}&#8451;`).openPopup();
        });
}
// Function to geocode an address and place a marker on the map


function geocodeAddress() {
    let address = document.getElementById('location').value;
    if (!address) {
        alert('Please enter a location');
        return;
    }
    let url = `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=${openCageKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results.length === 1) {
                let lat = data.results[0].geometry.lat;
                let lng = data.results[0].geometry.lng;
                let latLng = L.latLng(lat, lng);
                placeMarker(latLng);
                getWeather(lat, lng);
            } else if (data.results.length === 0) {
                alert('Address not found');
            } else {
                // Filter out results with the same components object
                let filteredResults = data.results.filter((result, index, self) => {
                    return index === self.findIndex(r => (
                        r.components.city === result.components.city &&
                        r.components.state === result.components.state &&
                        r.components.country === result.components.country
                    ));
                });

                if (filteredResults.length > 1) {
                    // Create new select element and populate it with the filtered results
                    let select = document.createElement('select');
                    select.setAttribute('id', 'locations');
                    filteredResults.forEach(result => {
                        let option = document.createElement('option');
                        option.value = result.formatted;
                        option.textContent = result.formatted;
                        select.appendChild(option);
                    });

                    // Remove any existing select elements
                    let existingSelect = document.getElementById('locations');
                    if (existingSelect) {
                        existingSelect.remove();
                    }

                    // Add new select element to search div
                    let searchDiv = document.getElementById('search');
                    searchDiv.appendChild(select);

                    select.addEventListener('change', function () {
                        let index = this.selectedIndex;
                        let lat = filteredResults[index].geometry.lat;
                        let lng = filteredResults[index].geometry.lng;
                        let latLng = L.latLng(lat, lng);
                        placeMarker(latLng);
                        getWeather(lat, lng);
                    });
                } else {
                    // Only one result, so no need for a select element
                    let lat = filteredResults[0].geometry.lat;
                    let lng = filteredResults[0].geometry.lng;
                    let latLng = L.latLng(lat, lng);
                    placeMarker(latLng);
                    getWeather(lat, lng);
                }
            }
        });
}

