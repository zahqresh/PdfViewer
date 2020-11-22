const express = require('express')
const app = express();
const ejs = require('ejs');
const port = 3000;
const db = require('./models/annotations');
const mongoose = require('mongoose');
const {
  v4: uuidv4
} = require('uuid');
var cors = require('cors')
const path = require('path');
const annotations = require('./models/annotations');
var data = {};
var rows = [];
var total = 0;
//enable cors
app.use(cors());
//serve static files
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

//setup db
mongoose.connect('mongodb://localhost:27017/pdfviewer', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, () => {
  console.log('DB connected!');
});


//setup view engine
app.set('view engine', 'ejs');

// All other routes should redirect to the index.html
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/example', (req, res) => {
  res.render('example');
});

app.get('/api/read', (req, res) => {
  res.json(data);
})

//Routes for annotation

//Create annotations
app.post('/api/annotations/:name', (req, res) => {
  //create a random id object for annotations
  let id = uuidv4();
  const {
    qoute,
    ranges,
    text
  } = req.body;
  const{
    name
  } = req.params;
  //create object
  let annotObj = {

    "id": id,
    "quote": qoute,
    ranges: ranges,
    text: text

  };
//save annotation object and send the response to create annotation
  db({
    file_name:name,
    rows:annotObj,
    id:id
  }).save().then(doc=>{
    res.json(doc.rows);
  })
});

//Apply all annotations when file is loaded
app.get('/api/search/:name', (req, res) => {
  const{
    name
  } = req.params;

  db.find({file_name:name}).then(doc=>{
    let annotations = [];
    doc.forEach(n=>{
      annotations.push(n.rows);
    });
    res.json({
      total:doc.length,
      rows:annotations
    });
  })
});


//Update one annotation
app.put('/api/annotations/:req_id', (req, res) => {
  const {
    qoute,
    ranges,
    text,
    id
  } = req.body;
  
  const{
    req_id
  } = req.params;

 let annotObj = {
    "id": id,
    "quote": qoute,
    ranges:ranges,
    text: text
  };
  db.findOneAndUpdate({id:req_id},{
    rows:annotObj
  }).then(doc=>{
    res.json(annotObj);
  })
})
//Delete one annotation
app.delete('/api/annotations/:req_id', (req, res) => {
  const{
    req_id
  } = req.params;

  db.findOneAndDelete({id:req_id}).then(()=>{
    res.json(req.body);
  })
})




app.listen(port, () => console.log(`Example app listening on ${port} port!`))