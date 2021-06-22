const express = require("express");
const router = express.Router(); // setup usage of the Express router engine
const port = 3000;
const axios = require("axios");
const fs = require('fs');
const spawn = require("child_process").spawn;

router.get("/", (req, res) => res.send("Hello World!"));

var crbUrl='https://www.waterqualitydata.us/Result/search?huc=17%3B1018%3B1002%3B1003%3B1004%3B1601%3B1404%3B1007%3B1008&siteType=Lake%2C%20Reservoir%2C%20Impoundment%3BStream&characteristicName=Temperature%2C%20water%3BTemperature%2C%20water%2C%20deg%20F%3BCalcium%3BpH&'

function dateFormatter(dateIn,toAdd){
  console.log('date in')
  console.log(dateIn)
  var newDate = dateIn;
  newDate.setDate(newDate.getDate() + toAdd);
  console.log('new day is')
  console.log(newDate)

  var thisMonth=newDate.getMonth()+1
  if(thisMonth.toString().length==1){
    thisMonth='0'+thisMonth.toString()
  }
  var thisDay=newDate.getDate()
  if(thisDay.toString().length==1){
    thisDay='0'+thisDay.toString()
  }
  var thisYear=newDate.getFullYear()
  newDate=thisMonth+'-'+thisDay+'-'+thisYear

  return(newDate)
}

router.get("/getWq", function(req, res){
  // this extracts the most recent date from all observation in the wqdatabase
  axios
    .get('http://localhost:3000/db/getLastWqDate')
    .then(returnedData=>{
      // this is the most recent day in the database
      var lastDbDate=new Date(returnedData.data.date)
      var newMinDate=lastDbDate;
      console.log(newMinDate)
      newMinDate.setDate(newMinDate.getDate()-20)
      // var lastDbDate=new Date("2019-12-31T06:00:00.000Z")
      // var lastDbDate=new Date("December 31 2019 12:30");
      // we want to increment one day onto this to set the next day as our minimum in queries
      var newMinDate=dateFormatter(newMinDate,0)

      var todaysDate = new Date();
      var todaysDate=dateFormatter(todaysDate,1)

      var queryUrl=crbUrl
      queryUrl+='startDateLo='+newMinDate+'&startDateHi='+todaysDate+'&mimeType=csv'
      // queryUrl+='startDateLo='+newMinDate+'&startDateHi=05-28-2019&mimeType=csv'

      // queryUrl='https://www.waterqualitydata.us/Result/search?huc=17&siteType=Lake%2C%20Reservoir%2C%20Impoundment%3BStream&characteristicName=Temperature%2C%20water%3BTemperature%2C%20water%2C%20deg%20F%3BCalcium%3BpH&startDateLo=01-01-2011&startDateHi=12-31-2019&mimeType=csv'
      console.log(queryUrl)
      queryWqServer(queryUrl)
    })

  function queryWqServer(queryUrl){
    axios
      .get(queryUrl)
      .then(returnedData => {
        fs.writeFile('./data/incomingWq/newWqData.csv', returnedData.data,function(){
          console.log('got wq')
          const wqCleaned=runPythonCleaning();
          res.status(200);
          res.send(wqCleaned)
        });
      })
      .catch(error => {
        res.status(400);
        console.error(error);
        // res.send({'response':'no data given selected parameters'})
      })
  }
});

function runPythonCleaning(){
  console.log('python cleaning')
  const cleanWqProcess = spawn('python',["./pyScripts/cleanWqData.py"]);
  cleanWqProcess.stdout.on('data', (data) => {
      var pyResp=data.toString().replace(/\s/g, "")
      console.log(pyResp)
      if(pyResp=='finished'){
        console.log('cleaning done')
        axios
          .get('http://localhost:3000/db/emptyStagingTable')
          .then(emptiedResponse=>{
            console.log(emptiedResponse.data)
            updateStagingTable();
        })
        return('finished')
      }
      if(pyResp=='noData'){
        console.log('no new data')
        return('no new data')
      }
  });
}

function updateStagingTable(){
  console.log('updating postgres staging table')
  const updateProcess = spawn('python',["./pyScripts/updateStagingTable.py"]);
  updateProcess.stdout.on('data', (data) => {
      var pyResp=data.toString().replace(/\s/g, "")
      if(pyResp=='finished'){
        insertStagingTable();
      }
  });
}

function insertStagingTable(){
  axios
    .get('http://localhost:3000/db/insertStagingTable')
    .then(insertedResponse=>{
      console.log(insertedResponse.data)
      updateMetadata();
  })
}

function updateMetadata(){
  axios
    .get('http://localhost:3000/metadata/updateMetadata')
    .then(updatedResponse=>{
      console.log(updatedResponse.data)
      // updateMetadata();
  })
}



module.exports = router;
