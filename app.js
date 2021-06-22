const express = require("express");
const app = express();
const axios = require("axios");
const port = 3000;
path = require("path");
const basicAuth = require('express-basic-auth');

var getWq = require('./routes/getWqData');
app.use('/wq', getWq);

var getSites = require('./routes/getSitesData');
app.use('/sites', getSites);

// var dbactions = require('./routes/dbfunctions');
var dbactions = require('./routes/dbfunctions');
app.use('/db', dbactions);

var metadataaction = require('./routes/updateMetadata');
app.use('/metadata', metadataaction);

app.use('/test', express.static('./gui'));


app.use('/gui', express.static('./gui/dist'));



function getWqData(){
  axios
    // .get('http://64.227.14.100:3000/wq/getWq')
    .get('http://localhost:3000/wq/getWq')
    .then(gotIt=>{
      console.log(gotIt)
    })
    .catch(error => {
      console.log(error)
    })
}
getWqData();
setInterval(function(){ getWqData(); }, 43200000);





app.listen(port, () => console.log(`Example app listening on port ${port}!`));
