const https = require("https");
const http = require("http");
const express = require("express");
const router = express.Router(); // setup usage of the Express router engine
const {Client} = require('pg');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(cors());

app.use(bodyParser.json()); // To support JSON-encoded bodies

app.options('*', cors());

var databaseconnection = new Client({
    user: "",
    password: "",
    database: "",
    port: 25060,
    host:"",
    ssl: true
});

databaseconnection.connect();

function pad2(n) { return n < 10 ? '0' + n : n }

function getDateTime(){
  var date = new Date();
  return(date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2( date.getDate()) + pad2( date.getHours() ) + pad2( date.getMinutes() ) + pad2( date.getSeconds() ));
}

router.get('/updatemetadata', function (request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  var countRowsCommand='SELECT COUNT(*) FROM crbwqdata;'
  databaseconnection.query(countRowsCommand, (errorOne, responseOne) => {
    if (errorOne) {
      return({status: 'bad SQL', result: []});
    } else {
      var thisCount=responseOne.rows[0];
      var getLastCountCommand='SELECT totalobs FROM crbmetadata ORDER BY lastupdated DESC LIMIT 1;'
      databaseconnection.query(getLastCountCommand, (errorTwo, responseTwo) => {
        if (errorTwo) {
          return({status: 'bad SQL', result: []});
        } else {

          var thisTime=getDateTime()
          var countObject={
            thisCount:thisCount.count,
            lastCount:responseTwo.rows[0].totalobs,
            newObs:Number(thisCount.count)-responseTwo.rows[0].totalobs,
            thisTime:thisTime
          }
          console.log(countObject)
          updateMetadataCommand='INSERT INTO crbmetadata (totalobs, newobs, lastupdated)  VALUES ('+countObject.thisCount+', '+countObject.newObs+', '+countObject.thisTime+');'
          console.log(updateMetadataCommand)
          databaseconnection.query(updateMetadataCommand, (errorThree, responsThree) => {
            if (errorThree) {
              response.send({status: 'bad SQL', result: []});
            } else {
              response.send({status: 'success', result: updateMetadataCommand});
            }
          })
        }
      })
    }
  })
})


module.exports = router;
