const express = require("express");
const router = express.Router(); // setup usage of the Express router engine
const port = 3000;
const axios = require("axios");
const fs = require('fs');
const spawn = require("child_process").spawn;

router.get("/", (req, res) => res.send("Hello World!"));

// var upperYellowstoneSitesUrl='https://www.waterqualitydata.us/data/Station/search?huc=100700&mimeType=csv'
// var crbSitesUrl='https://www.waterqualitydata.us/data/Station/search?huc=1018;1002;1003;1004;1601;1404;1007;1008&mimeType=csv'
var crbSitesUrl='https://www.waterqualitydata.us/data/Station/search?huc=17;1018;1002;1003;1004;1601;1404;1007;1008&mimeType=csv'

router.get("/getSites", function(req, res){
  console.log('getting sites')
  console.log(crbSitesUrl)
  axios
    .get(crbSitesUrl)
    .then(returnedData => {
      fs.writeFile('./data/incomingWq/newSitesData.csv', returnedData.data,function(){
        console.log('got sites')
        // const sitesCleaned=runPythonCleaning();
        // res.send(sitesCleaned)
        res.send({'msg':'got the sites and cleaned.. not inserting at this time'})
      })
    })
    .catch(error => {
      console.error(error);
    })
});

function runPythonCleaning(){
  console.log('python cleaning sites')
  const cleanWqProcess = spawn('python',["./pyScripts/cleanSitesData.py"]);
  cleanWqProcess.stdout.on('data', (data) => {
      var pyResp=data.toString().replace(/\s/g, "")
      console.log(pyResp)
      if(pyResp=='finished'){
        console.log('cleaning done')
        return('finished')
      }
  });
}

module.exports = router;
