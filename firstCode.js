require('dotenv').config(); // isse hum PORT ya datbase jo bhi common rehta hai usko define karte h
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/twitter', (req, res) => {
  res.send('Hello Twitter!');
});

app.get('/login', (req, res) => {
  res.send('<h1> Please Login <h1>');
});

app.listen(process.env.PORT, () => {
  // "process.env" use karne ka tarika h line no.1 ko
  console.log(`Example app listening at http://localhost:${port}`);
});
