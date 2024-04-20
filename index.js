import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.set("views", process.cwd() + "/views");
app.set("view engine", "ejs");
app.use(express.static('lib'));
app.use(express.static('images'));
app.use(express.static('views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const openWeatherKey = process.env.AUTH_TOKEN;
const openCageKey = process.env.AUTH_TOKEN2;


;



app.get('/', (req, res) => {
  res.render('index');
});


app.post('/geocode', (req, res) => {
  console.log('Geocode request received');
  const address = req.body.address;
  if (!address) {
    res.status(400).send({ error: 'Please enter a location' });   
    return;
  }
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=${openCageKey}`;
  fetch(url)
  .then(response => {
     return response.json();
   })
  .then(data => {
      if (data.results.length === 0) {
        res.status(404).send({ error: 'Address not found' });
      } else {
        const firstResult = data.results[0];
        const lat = firstResult.geometry.lat;
        const lng = firstResult.geometry.lng;
        res.json({ lat, lng });
      }
    })
  .catch(error => {
      res.status(500).send({ error: 'Internal Server Error' });
    });
});


app.post('/weather', (req, res) => {
  const lat = req.body.lat;
  const lng = req.body.lng;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&lang=en&appid=${openWeatherKey}&units=metric`;
  fetch(url)
   .then(response => response.json())
   .then(data => {
      const temp = Math.round(data.main.temp);
      res.json({ temp });
    })
   .catch(error => {
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});