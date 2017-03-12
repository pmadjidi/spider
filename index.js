var request = require('request');
var stream = require('stream');
var express = require('express')
var bodyParser = require('body-parser')


var api = require('./api')

var app = express()
app.use(bodyParser.urlencoded({
  extended: true
}))


app.get('/', function (req, res) {
  res.send('Performance world')
})

app.get('/api/:key', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.setHeader('Content-Type', 'application/json');
  let key = req.params.key
  console.log(key)
  let result = api.getStat({key: key})
  result.pipe(res)
  })

  app.get('/api/system/:key', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.setHeader('Content-Type', 'application/json');
    let key = req.params.key
    console.log(key)
    let result = api.getStat({key: key})
    result.pipe(res)
    })



  app.get('/stocks/:name', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.setHeader('Content-Type', 'application/json');
    let symbol = req.params.name
    console.log(symbol)
    console.log("Stock ticks for .......",symbol)
    let result = api.getStock({symbol,res})
    })

    app.get('/news/:name', function (req, res) {
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "X-Requested-With")
      res.setHeader('Content-Type', 'application/json');
      let symbol = req.params.name
      console.log("News for .......",symbol)
      let result = api.getStockNews({symbol,res})
      })




var server = app.listen(4000, function () {
  console.log('Server running at http://localhost:' + server.address()
    .port)
})
