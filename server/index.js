const express = require('express')
require('dotenv').config()
const IgApiClient = require('instagram-private-api')
const app = express()

app.use(express.json())
const PORT = process.env.PORT || '5000'
function startServer(){
  try {
    app.listen(PORT, ()=>{console.log(`Сервер запущен на порту ${PORT}...`);})
  } catch (error) {
    
  }
}
startServer()