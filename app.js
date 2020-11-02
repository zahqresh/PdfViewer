const express = require('express')
const app = express()
const port = 3000
const path = require('path')
//serve static files
  app.use(express.static( path.join(__dirname, './public') ))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  

// All other routes should redirect to the index.html
app.get('/', (req, res) => {res.sendFile( path.join(__dirname, './public/html/editor.html') )});
  

app.listen(port, () => console.log(`Example app listening on ${port} port!`))