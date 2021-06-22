const express = require("express");
const router = express.Router(); // setup usage of the Express router engine
const port = 3000;
const axios = require("axios");
const fs = require('fs');
const spawn = require("child_process").spawn;

router.get("/", (req, res) => res.send("Hello World!"));

// this is a list of all parameters available in parameter monitoring codes
// https://help.waterdata.usgs.gov/codes-and-parameters/parameters

var startDate='2015-01-01'
var endDate='2019-11-05'
var upperYellowstoneFlowUrl='https://nwis.waterservices.usgs.gov/nwis/dv/?format=json&huc=10070001,10070002,10070003&startDT='+startDate+'&endDT='+endDate+'&parameterCd=00060&siteType=ST&siteStatus=all'
// var upperYellowstoneFlowUrl='https://nwis.waterservices.usgs.gov/nwis/dv/?format=json&huc=10070001&startDT=2017-01-01&endDT=2019-11-05&parameterCd=00910,00915,00916,091051&siteType=ST&siteStatus=all'

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
  var thisDay=newDate.getDate()+1
  var thisYear=newDate.getFullYear()
  newDate=thisMonth+'-'+thisDay+'-'+thisYear
  console.log('-----------------')
  console.log(newDate)
  console.log('-----------------')
  return(newDate)
}

function formatFlowData(dataIn,callback){
  console.log(dataIn)
  var csvString='sitename,sitecode,sitenetwork,agencycode,monitoringlocationidentifier,srs,lat,lon,huc,flowcfs,date\r\n'
  var siteCounter=0;
  dataIn.forEach(site => {
    siteCounter++
    console.log(site)
    var valuesCounter=0;
    siteName=site.sourceInfo.siteName.replace(/,/g, '');
    siteCode=site.sourceInfo.siteCode[0].value;
    sitenetwork=site.sourceInfo.siteCode[0].network;
    agency=site.sourceInfo.siteCode[0].agencyCode;
    monitoringlocationidentifier=agency+'-'+siteCode;
    srs=site.sourceInfo.geoLocation.geogLocation.srs;
    lat=site.sourceInfo.geoLocation.geogLocation.latitude;
    lon=site.sourceInfo.geoLocation.geogLocation.longitude;
    huc=site.sourceInfo.siteProperty[1].value;
    siteAttributes=siteName+','+siteCode+','+sitenetwork+','+agency+','+monitoringlocationidentifier+','+srs+','+lat+','+lon+','+huc+','
    site.values[0].value.forEach(thisValue => {
      valuesCounter++
      newRow=siteAttributes+thisValue.value+','+thisValue.dateTime.split('T')[0];
      csvString+=newRow
      csvString+="\r\n"
    })
    if(siteCounter==dataIn.length && valuesCounter == site.values[0].value.length){
      callback(csvString)
    }
  });
}

router.get("/getFlow", function(req, res){
  axios
    .get(upperYellowstoneFlowUrl)
    .then(returnedData => {
      if(returnedData.data.value.timeSeries.length>0){
          formatFlowData(returnedData.data.value.timeSeries,returnedCsv=>{
            fs.writeFile('D:/desktop/newflow.csv', returnedCsv,function(){
              res.send('checker')
            });
          })
      }

      // fs.writeFile('./data/incomingWq/newWqData.csv', returnedData.data,function(){
      //   console.log('got wq')
      //   const wqCleaned=runPythonCleaning();
      //   res.status(200);
      //   res.send(wqCleaned)
      // });
    })
    .catch(error => {
      res.status(400);
      console.error(error);
      // res.send({'response':'no data given selected parameters'})
    })
});

function runPythonCleaning(){
  console.log('python cleaning')
  const cleanWqProcess = spawn('python',["./pyScripts/cleanWqData.py"]);
  cleanWqProcess.stdout.on('data', (data) => {
      var pyResp=data.toString().replace(/\s/g, "")
      console.log(pyResp)
      if(pyResp=='finished'){
        console.log('cleaning done')
        updateWqTable();
        return('finished')
      }
      if(pyResp=='noData'){
        console.log('no new data')
        return('no new data')
      }
  });
}

function updateWqTable(){
  console.log('updating postgres')
  const updateProcess = spawn('python',["./pyScripts/updateTable.py"]);
  updateProcess.stdout.on('data', (data) => {
      var pyResp=data.toString().replace(/\s/g, "")
      console.log(pyResp)
  });
}

module.exports = router;
