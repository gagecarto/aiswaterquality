const https = require("https");
const http = require("http");
const express = require("express");
const router = express.Router(); // setup usage of the Express router engine
const {
  Client
} = require('pg');
const app = express();
const cors = require('cors');;
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
  host: "",
  ssl: true
});

databaseconnection.connect();


router.get('/queryDailyWq', function(req, res) {
  console.log('getting last date')
  res.setHeader('Access-Control-Allow-Origin', '*');
  minDate = '2019-08-01'
  maxDate = '2020-02-25'
  if (req.query.minDate) {
    minDate = req.query.minDate
  }
  if (req.query.maxDate) {
    maxDate = req.query.maxDate
  }
  console.log(req.query)

  if (req.query.poly) {
    var wqQueryString = "SELECT * from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'  AND monitoringlocationidentifier in (" + polySelectPiece + ") ORDER BY date;"
  }

  if (req.query.huc) {
    var wqQueryString = "SELECT * from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'  AND  monitoringlocationidentifier in (SELECT monitoringlocationidentifier FROM crbsites_1 WHERE istheredata is TRUE and huceightdigitcode=" + req.query.huc + "  and monitoringlocationidentifier LIKE '%USBR%') ORDER BY date;"
  }

  if (req.query.monitoringlocationidentifier) {
    var wqQueryString = "SELECT * from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'  AND  monitoringlocationidentifier in ('" + req.query.monitoringlocationidentifier + "') ORDER BY date;"
  }

  if (!wqQueryString) {
    var wqQueryString = "SELECT * from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'   ORDER BY date;"
  }



  console.log(wqQueryString)


  databaseconnection.query(wqQueryString, (wqErr, wqResponse) => {
    console.log(wqResponse)
    wqData = wqResponse.rows;
    if (wqErr) {
      console.log(wqErr.stack)
    } else {

      res.send(wqData)
    }
  })


})



router.get('/queryWq', function(req, res) {
  console.log('getting last date')
  res.setHeader('Access-Control-Allow-Origin', '*');
  minDate = '2019-08-01'
  maxDate = '2020-02-25'
  if (req.query.minDate) {
    minDate = req.query.minDate
  }
  if (req.query.maxDate) {
    maxDate = req.query.maxDate
  }
  console.log(req.query)

  if (req.query.poly) {
    console.log('95')
    var polySelectPiece = "select monitoringlocationidentifier from crbsites_1 WHERE istheredata is TRUE AND ST_Within(crbsites_1.geom, ST_Setsrid(ST_GeomFromGeoJSON("
    polySelectPiece += '\'{"coordinates":' + req.query.poly + ',"type":"Polygon"}\''
    polySelectPiece += "),4326))"
    var wqQueryString = "SELECT * from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'  AND monitoringlocationidentifier in (" + polySelectPiece + ") ORDER BY date;"
    var wqQueryStringNoData = "SELECT * from crbwqdata where AND monitoringlocationidentifier in (" + polySelectPiece + ") ORDER BY date DESC LIMIT 1;"
    var sitesQueryString = "SELECT DISTINCT monitoringlocationidentifier from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "' AND monitoringlocationidentifier in (" + polySelectPiece + ");"
    var averagesQueryString = "SELECT monitoringlocationidentifier, ROUND(AVG (phmean),2) AS phmean, SUM (phcnt) AS phcnt, ROUND(avg (camean),2) AS camean, ROUND(avg (tempmean),2) AS tempmean, SUM (cacnt) AS cacnt, SUM (tempcnt) AS tempcnt from crbwqdata where crbwqdata.date >= '" + minDate + "' AND crbwqdata.date <= '" + maxDate + "'  AND monitoringlocationidentifier in (" + polySelectPiece + ") GROUP BY monitoringlocationidentifier"
    // var queryString='SELECT siteid, ROUND(avg (camean),2) AS camean, ROUND(avg (tempmean),2) AS tempmean, SUM (cacnt) AS cacnt FROM waterquality WHERE tempmean IS NOT NULL and camean IS NOT NULL AND EXTRACT(MONTH FROM date) in (6,7,8,9) AND EXTRACT(YEAR FROM date) >= '+minYear+' GROUP BY siteid;'
  }

  if (req.query.huc) {
    var wqQueryString = "SELECT * from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'  AND monitoringlocationidentifier in (SELECT monitoringlocationidentifier FROM crbsites_1 WHERE istheredata is TRUE and huceightdigitcode=" + req.query.huc + ") ORDER BY date;"
    var wqQueryStringNoData = "SELECT * from crbwqdata where AND monitoringlocationidentifier in (SELECT monitoringlocationidentifier FROM crbsites_1 WHERE istheredata is TRUE and huceightdigitcode=" + req.query.huc + ") ORDER BY date DESC LIMIT 1;"
    var sitesQueryString = "SELECT DISTINCT monitoringlocationidentifier from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'  AND monitoringlocationidentifier in (SELECT monitoringlocationidentifier FROM crbsites_1 WHERE istheredata is TRUE and huceightdigitcode=" + req.query.huc + ");"
    var averagesQueryString = "SELECT monitoringlocationidentifier, AVG (phmean) AS phmean, SUM (phcnt) AS phcnt, ROUND(avg (camean),2) AS camean, ROUND(avg (tempmean),2) AS tempmean, SUM (cacnt) AS cacnt, SUM (tempcnt) AS tempcnt from crbwqdata where crbwqdata.date >= '" + minDate + "' AND crbwqdata.date <= '" + maxDate + "'  AND monitoringlocationidentifier in (SELECT monitoringlocationidentifier FROM crbsites_1 WHERE istheredata is TRUE and huceightdigitcode=" + req.query.huc + ") GROUP BY monitoringlocationidentifier"  }

  if (req.query.monitoringlocationidentifier) {
    console.log('120')
    var wqQueryString = "SELECT * from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'  AND monitoringlocationidentifier in ('" + req.query.monitoringlocationidentifier + "') ORDER BY date;"
    var wqQueryStringNoData = "SELECT * from crbwqdata where AND monitoringlocationidentifier in ('" + req.query.monitoringlocationidentifier + "') ORDER BY date DESC LIMIT 1;"
    var averagesQueryString = "SELECT monitoringlocationidentifier, ROUND(AVG (phmean),2) AS phmean, SUM (phcnt) AS phcnt, ROUND(avg (camean),2) AS camean, ROUND(avg (tempmean),2) AS tempmean, SUM (cacnt) AS cacnt, SUM (tempcnt) AS tempcnt from crbwqdata where crbwqdata.date >= '" + minDate + "' AND crbwqdata.date <= '" + maxDate + "'  AND monitoringlocationidentifier in ('" + req.query.monitoringlocationidentifier + "') GROUP BY monitoringlocationidentifier"
  }

  if (!wqQueryString) {
    var wqQueryString = "SELECT * from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'  ORDER BY date;"
    var sitesQueryString = "SELECT DISTINCT monitoringlocationidentifier from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "';"
    var wqQueryStringNoData = "SELECT * from crbwqdata ORDER BY date DESC LIMIT 1;"
    var averagesQueryString = "SELECT monitoringlocationidentifier, ROUND(AVG (phmean),2) AS phmean, SUM (phcnt) AS phcnt, ROUND(avg (camean),2) AS camean, ROUND(avg (tempmean),2) AS tempmean, SUM (cacnt) AS cacnt, SUM (tempcnt) AS tempcnt from crbwqdata where crbwqdata.date >= '" + minDate + "' AND crbwqdata.date <= '" + maxDate + "'  GROUP BY monitoringlocationidentifier"
  }


  // var averagesQueryString="SELECT * FROM crbsites_1 INNER JOIN("+averagesQueryString+") AS avgdata ON avgdata.monitoringlocationidentifier = crbsites_1.monitoringlocationidentifier";
  var averagesQueryStringToJoin = "SELECT * FROM crbsites_1 INNER JOIN(" + averagesQueryString + ") AS avgdata ON avgdata.monitoringlocationidentifier = crbsites_1.monitoringlocationidentifier";
  var averagesQueryStringJoined = "SELECT crbwqdata.*, reachcode, oneup, twoup, onedown, twodown FROM flowlineslookup INNER JOIN(" + averagesQueryStringToJoin + ") AS crbwqdata ON crbwqdata.nearstream = flowlineslookup.reachcode"

  console.log(wqQueryString)
  console.log('-------------------')
  console.log("Avg query string")
  console.log(averagesQueryString)
  console.log('-------------------')
  console.log("Avg query string JOINED")
  console.log(averagesQueryStringJoined)
  console.log('-------------------')


  var responseObject = {
    wqData: null,
    avgData: null,
    sitesData: null,
    lastDate: null
  }

  var sitesQuery = {
    text: sitesQueryString,
    rowMode: 'array'
  }

  var averagesQueryStringJoined="SELECT * FROM crbwqdata LIMIT 1;"

  databaseconnection.query(averagesQueryStringJoined, (avgErrJoined, avgResponseJoined) => {
    responseObject.avgDataJoined = avgResponseJoined.rows;
    databaseconnection.query(averagesQueryString, (avgErr, avgResponse) => {
      responseObject.avgData = avgResponse.rows;
      if (!sitesQueryString) {
        responseObject.sitesData = [{
          'req.query.monitoringlocationidentifier': ''
        }]
        res.send(responseObject)
      } else {
        databaseconnection.query(sitesQuery, (sitesErr, sitesResponse) => {
          if (sitesErr) {
            console.log(sitesErr.stack)
          } else {
            sitesData = sitesResponse.rows
            responseObject.sitesData = sitesData
            databaseconnection.query(wqQueryStringNoData, (noDataErr, noDataResponse) => {
              if (noDataErr) {
                console.log(noDataErr.stack)
              } else {
                responseObject.lastDate = noDataResponse.rows;
                res.send(responseObject)
              }
            })
          }
        })
      }
    })
  })

})

router.get('/queryWqAllSites', function(req, res) {
  console.log('getting last date')
  res.setHeader('Access-Control-Allow-Origin', '*');
  minDate = '2019-08-01'
  maxDate = '2020-02-25'
  if (req.query.minDate) {
    minDate = req.query.minDate
  }
  if (req.query.maxDate) {
    maxDate = req.query.maxDate
  }
  var queryString = "SELECT * from crbwqdata where date >= '" + minDate + "' AND date <= '" + maxDate + "'"
  queryString += " ORDER BY date;"
  console.log(queryString)
  databaseconnection.query(queryString, (err, response) => {
    if (err) {
      console.log(err.stack)
    } else {
      res.send(response.rows)
    }
  })
})


router.get('/getLastWqDate', function(req, res) {
  console.log('getting last date')
  res.setHeader('Access-Control-Allow-Origin', '*');
  var getLastDateQuery = 'SELECT date FROM crbcrbwqdata ORDER BY date DESC LIMIT 1;'
  databaseconnection.query('SELECT date FROM crbwqdata ORDER BY date DESC LIMIT 1;', (err, response) => {
    if (err) {
      console.log(err.stack)
    } else {
      res.send(response.rows[0])
    }
  })
})

router.get('/getSites', function(req, res) {
  console.log('getting sites')
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log(req.query)
  if (req.query.region == 'gye') {
    var getSitesQuery = 'SELECT * FROM crbsites_1 WHERE istheredata is TRUE and huceightdigitcode in (17040104,17040201,17040202,17040203,17040205,17040207,17040214, 17040215, 17040105, 17040204, 17040101, 17040102, 17040103) or huceightdigitcode < 17000000 and istheredata is TRUE'
  }
  if (req.query.region == 'crb') {
    var getSitesQuery = 'SELECT * FROM crbsites_1 WHERE istheredata is TRUE and huceightdigitcode > 16999999'
  }
  if (req.query.region == 'usr') {
    var getSitesQuery = 'SELECT * FROM crbsites_1 WHERE istheredata is TRUE and huceightdigitcode > 17040100 and huceightdigitcode < 17040221'
  }
  if (req.query.justbor == 'true') {
    getSitesQuery += " and isbor = true"
  }
  if (req.query.justph == 'true') {
    getSitesQuery += " and arethereonlyph = true"
  }
  if (req.query.region == 'clams') {
    getSitesQuery = "SELECT row_to_json(featcoll) FROM " +
      "(SELECT 'FeatureCollection' As type, array_to_json(array_agg(feat)) As features " +
      "FROM (SELECT 'Feature' As type, " +
      "ST_AsGeoJSON(tbl.geom)::json As geometry, " +
      'row_to_json((SELECT l FROM (SELECT id, "group", "common nam", "locality","status","year","record_typ","comments") As l) ' +
      ") As properties " +
      'FROM "crbClams" As tbL   ' +
      "WHERE status != 'unknown'  " +
      ")  As feat " +
      ")  As featcoll"
  }
  getSitesQuery += " and organizationformalname not LIKE ALL(ARRAY['%Superfund%', '%Mine%', 'Bunker%']);"
  console.log(getSitesQuery)
  databaseconnection.query(getSitesQuery, (err, response) => {
    if (err) {
      console.log(err.stack)
    } else {
      res.send(response.rows)
    }
  })
})

router.get('/getLastDataAdded', function(req, res) {
  console.log('getting last data added')
  res.setHeader('Access-Control-Allow-Origin', '*');
  var getLastUpdated = 'SELECT * FROM crbmetadata WHERE newobs > 0 ORDER BY lastupdated DESC LIMIT 1;'
  databaseconnection.query(getLastUpdated, (err, response) => {
    if (err) {
      console.log(err.stack)
    } else {
      res.send(response.rows[0])
    }
  })
})

router.get('/getLastUpdate', function(req, res) {
  console.log('getting last date')
  res.setHeader('Access-Control-Allow-Origin', '*');
  var getLastUpdated = 'SELECT * FROM crbmetadata ORDER BY lastupdated DESC LIMIT 1;'
  databaseconnection.query(getLastUpdated, (err, response) => {
    if (err) {
      console.log(err.stack)
    } else {
      res.send(response.rows[0])
    }
  })
})


router.get('/dropRows', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.query.num) {
    var dropLastTen = 'DELETE FROM crbwqdata WHERE date in (SELECT date FROM crbwqdata ORDER BY date desc LIMIT ' + req.query.num + ');'
    databaseconnection.query(dropLastTen, (err, response) => {
      if (err) {
        res.status(400);
        res.send({
          status: 'bad SQL',
          queryString,
          result: []
        });
      } else {
        res.status(200);
        res.send({
          status: 'success',
          result: req.query.num + ' rows dropped'
        })
      }
    })
  } else {
    res.status(200);
    res.send({
      status: 'no go',
      result: 'need to provide a req.query.num parameter... e.g.  http://localhost:3000/db/dropRows?num=3'
    })
  }
})

router.get('/emptyStagingTable', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var emptyTable = 'TRUNCATE crbwqstaging;'
  console.log(emptyTable)
  databaseconnection.query(emptyTable, (err, response) => {
    if (err) {
      res.status(400);
      res.send({
        status: 'bad SQL',
        queryString,
        result: []
      });
    } else {
      res.status(200);
      res.send({
        status: 'success',
        result: 'wqstaging table truncated'
      })
    }
  })
})

router.get('/insertStagingTable', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var insertCommand = 'INSERT INTO crbwqdata SELECT * FROM crbwqstaging ON CONFLICT (sitedate) DO UPDATE SET phmean = excluded.phmean, phmax = excluded.phmax, phmin = excluded.phmin, phsd = excluded.phsd, phcnt = excluded.phcnt, camean = excluded.camean, camax = excluded.camax, camin = excluded.camin, casd = excluded.casd, cacnt = excluded.cacnt, tempmean = excluded.tempmean, tempmax = excluded.tempmax, tempmin = excluded.tempmin, tempsd = excluded.tempsd, tempcnt = excluded.tempcnt;'
  databaseconnection.query(insertCommand, (err, response) => {
    if (err) {
      res.status(400);
      res.send({
        status: 'bad SQL',
        insertCommand,
        result: []
      });
    } else {
      res.status(200);
      res.send({
        status: 'success',
        result: 'wqdata table updated',
        response: response
      })
    }
  })
})

router.get('/updateSitesWithData', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var sitesWithDataCommand = 'UPDATE crbsites_1 SET istheredata=TRUE WHERE crbsites_1.monitoringlocationidentifier IN(SELECT DISTINCT monitoringlocationidentifier FROM crbwqdata);'
  databaseconnection.query(sitesWithDataCommand, (err, response) => {
    if (err) {
      res.status(400);
      res.send({
        status: 'bad SQL',
        sitesWithDataCommand,
        result: []
      });
    } else {
      res.status(200);
      res.send({
        status: 'success',
        result: 'sites with data updated',
        response: response
      })
    }
  })
})




module.exports = router;
