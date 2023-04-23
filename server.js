const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3000;
const openWeatherKey = process.env.AUTH_TOKEN;
const openCageKey = process.env.AUTH_TOKEN2;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/search', (req, res) => {
    let address = req.body.location;

    if (!address) {
        res.status(400).send('Please enter a location');
        return;
    }

    let url = `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=${openCageKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results.length === 1) {
                let lat = data.results[0].geometry.lat;
                let lng = data.results[0].geometry.lng;
                let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&lang=en&appid=${openWeatherKey}&units=metric`;
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        let temp = Math.round(data.main.temp);
                        res.status(200).send(`<h1>${temp}&#8451;</h1>`);
                    });
            } else if (data.results.length === 0) {
                res.status(404).send('Address not found');
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
                    let selectOptions = '';
                    filteredResults.forEach(result => {
                        selectOptions += `<option value="${result.formatted}">${result.formatted}</option>`;
                    });
                    res.status(200).send(`
                        <h3>Select a location:</h3>
                        <select id="locations">${selectOptions}</select>
                        <button onclick="getWeather()">Get Weather</button>
                        <script>
                            function getWeather() {
                                let location = document.getElementById('locations').value;
                                let url = '/search?location=' + encodeURIComponent(location);
                                fetch(url)
                                    .then(response => response.text())
                                    .then(data => {
                                        document.getElementById('weather').innerHTML = data;
                                    });
                            }
                        </script>
                    `);
                } else {
                    let lat = filteredResults[0].geometry.lat;
                    let lng = filteredResults[0].geometry.lng;
                    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&lang=en&appid=${openWeatherKey}&units=metric`;
                    fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            let temp = Math.round(data.main.temp);
                            res.status(200).send(`<h1>${temp}&#8451;</h1>`);
                        });
                }
            }
        });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
