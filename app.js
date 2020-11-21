const express = require('express')
const app = express()
const port = 3000;
const axios = require('axios');
const {
  v4: uuidv4
} = require('uuid');
var cors = require('cors')
const path = require('path');
var data = {};
var rows = [];
var total = [];
//enable cors
app.use(cors())
//serve static files
app.use(express.static(path.join(__dirname, './public')))
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))


// All other routes should redirect to the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/html/editor.html'))
});

app.get('/api/read', (req, res) => {
  res.json(data);
})

//Routes for annotations
app.post('/api/annotations', (req, res) => {
  console.log(req.params);
  const {
    qoute,
    ranges,
    text
  } = req.body;
  res.json({
    "id": "aa2edd3d-d6ca-48ad-93f5-fe2ecde302f0",
    "ranges": [{
      "start": "/div[2]/div[1]/div[1]/div[1]",
      "startOffset": 1,
      "end": "/div[2]/div[1]/div[1]/div[2]",
      "endOffset": 13
    }],
    "text": "sd"
  });

  data = {

    "id": uuidv4(),
    "quote": qoute,
    ranges: ranges,
    text: text

  };
  console.log('in /api/annotations');
});

//somehow need to figure out how to load all the annoations once file has been loaded
app.get('/api/search', (req, res) => {
  res.send({
    "id": "aa2edd3d-d6ca-48ad-93f5-fe2ecde302f0",
    "ranges": [{
      "start": "/div[2]/div[1]/div[1]/div[1]",
      "startOffset": 1,
      "end": "/div[2]/div[1]/div[1]/div[2]",
      "endOffset": 13
    }],
    "text": "sd"
  });
  console.log('in search');
});

//Update one annotation
app.put('/api/annotations/:id', (req, res) => {
  const {
    qoute,
    ranges,
    text
  } = req.body;
  res.json({
    "id": uuidv4(),
    "quote": qoute,
    ranges: ranges,
    text: text
  });
  console.log('in put');
})
//Delete one annotation
app.delete('/api/annotations/:id', (req, res) => {
  const {
    qoute,
    ranges,
    text
  } = req.body;
  res.json({
    "id": uuidv4(),
    "quote": qoute,
    ranges: ranges,
    text: text
  });
  console.log('in delte');
})




app.listen(port, () => console.log(`Example app listening on ${port} port!`))