var exec = require('child_process')
  .exec
var shellParser = require('node-shell-parser');
var child = require('child_process');
var si = require('systeminformation');
var request = require('request');
var stream = require('stream');
var googleFinance = require('google-finance');
var r = require('rethinkdb')
var csv2json = require('csv2json');
var fs = require('fs');
var companyJson = require('./companylist.json')

companyJson.map((item,index)=>console.log(index,item))

let DATABASE = []
let STOCKBASE = JSON.stringify(companyJson)
let STOCKSTREAME = new stream.Readable({
  objectMode: true
})

STOCKSTREAME.push(STOCKBASE)
STOCKSTREAME.push(null)


var connection = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
    console.log("connected",conn.port)
})


funcArray = [
si.system,
si.osInfo,
si.versions,
si.shell,
si.cpu,
si.cpuFlags,
si.cpuCache,
si.cpuCurrentspeed,
si.cpuTemperature,
si.mem,
si.battery,
si.graphics,
si.fsSize,
si.blockDevices,
si.fsStats,
si.disksIO,
si.networkInterfaces,
si.networkInterfaceDefault,
si.networkConnections,
si.currentLoad,
si.fullLoad,
si.services,
si.processes,
si.dockerAll,
si.getStaticData]



function PromiseWrap(func,index) {
  let key
  let result = new Promise(resolve => func(data => resolve(data)))
  switch (index) { // correcting missing function names
    case 0:
    key = 'system'
    break
    case 9:
    key = 'mem'
    break
    case 10 :
    key = 'battery'
    break
    default:
    key = func.name
  }
  return result.then(data => {
    return {
      time: new Date().getTime(),
      key,
      data
    }
  })
}

function monitor(key) {
  return Promise.all(funcArray.map((func,index) => PromiseWrap(func,index)))
    .then(fv => {
      let ans
      if (key === 'all')
        ans = fv
      else
        ans = fv.filter(data => (data.key === key))
        return ans
    })
}




function getStat({key}) {
  let result
  let rs = new stream.Readable({
    objectMode: true
  })
  if ( key === 'stocks') {
    return STOCKSTREAME
  }
  if ( key === 'complist') {
    rs.push(JSON.stringify(companyJson))
    rs.push(null)
    return rs
}
  if (DATABASE.length === 0) {
    rs.push(null)
    return rs
  }
  else if (key === 'all') {
     result = DATABASE[DATABASE.length - 1 ]
  }
  else if ( DATABASE.length < 100) {
    result = DATABASE.map(stat=>stat.filter(item=>(item.key === key)))
  }
  else {
    result = DATABASE.slice(DATABASE.length - 100,DATABASE.length).map(stat=>stat.filter(item=>(item.key === key)))
}
  console.log(result)
  rs.push(JSON.stringify(result,null,4))
  rs.push(null)
  return rs
}


function getDateNow() {
var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
newdate = year + "-" + month + "-" + day
}
getDateNow()

function getStock({symbol,res,from = '2014-01-01',to ='2017-03-12'}) {

  let rs = new stream.Readable({
    objectMode: true
  })

  googleFinance.historical({
  symbol,
  from,
  to }, function (err, quotes) {
    if (err){
      console.log(err)
      data = "NO DATA....."
      rs.push(data)
      rs.push(null)
      rs.pipe(res)
      return rs
    }
  console.log("quotes.length",quotes.length)
  STOCKBASE = quotes
  let data = JSON.stringify(quotes)
  console.log(data);
  rs.push(data)
  rs.push(null)
  rs.pipe(res)
  return rs
  });
}


function getStockNews({symbol,res}) {

  let rs = new stream.Readable({
    objectMode: true
  })

  googleFinance.companyNews({
    symbol: symbol
  }, function (err, news) {
    if (err){
      console.log(err)
      data = "NO DATA....."
      rs.push(data)
      rs.push(null)
      rs.pipe(res)
      return rs
    }
  console.log("quotes.length",news.length)
  let data = JSON.stringify(news)
  console.log(data);
  rs.push(data)
  rs.push(null)
  rs.pipe(res)
  return rs
  });
}




setInterval(function() {
  monitor("all")
  .then(result=>DATABASE.push(result))
  .then(()=>console.log("database size:",DATABASE.length))
  }, 10000)


module.exports = {
  getStat,
  getStock,
  getStockNews
}
