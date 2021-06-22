axios.get(serverRoot + 'db/getLastDataAdded')
  .then(function(response) {
    metadataObject.lastDataAdded = response.data
    axios.get(serverRoot + 'db/getLastUpdate')
      .then(function(responseLastUpdate) {
        metadataObject.lastUpdated = responseLastUpdate.data;
        renderMetadata();
      })
      .catch(function(error) {
        console.log(error);
      })
  })
  .catch(function(error) {
    console.log(error);
  })

function queryWqData(queryUrl) {
  $('.progress').show()
  axios.get(queryUrl)
    .then(function(response) {
      console.log(response.data)
      if (response.data.avgDataJoined && response.data.avgDataJoined.length == 0) {
        if (response.data.lastDate && response.data.lastDate.length > 0) {
          M.Toast.dismissAll();
          M.toast({
            html: 'Current date range resulted in no data. Last observation within this location occured on ' + response.data.lastDate[0].date.substring(0, 10)
          })
        } else {
          M.Toast.dismissAll();
          M.toast({
            html: 'Current date range and location resulted in no data.. Try again'
          })
        }
        $('.progress').hide()
        clearSitesWithData();
        clearSitesSelected();
        tableUpdate(null);
        return true;
      }
      if (response.data.avgDataJoined) {
        metadataObject.currentRows = response.data.avgData.length
        returnedData = response.data
        returnedData.sitesData = response.data.sitesData.flatMap(row => row)
        // metadataObject.currentRows=returnedData.wqData.length
        metadataObject.currentSites = returnedData.sitesData.length

        if (!selectedSite) {
          setSitesFilter(response.data.sitesData)
        }
        if (!avgTable) {
          tableInit()
        } else {
          tableUpdate()
        }
        groupSitesByRisk()
      }
    })
    .catch(function(error) {
      console.log(error);
    })
}

function queryDailyWqData(queryUrl) {
  console.log('daily!!!!!!!!!')
  $('.progress').show()
  axios.get(queryUrl)
    .then(function(response) {
      var csv = Papa.unparse(response.data);
      downloadFile(csv, minDate + '_' + maxDate + 'DailyResults.csv', 'text/csv');
      $('.progress').hide()
    })
    .catch(function(error) {
      console.log(error);
      $('.progress').hide()
    })
}

function downloadFile(file, name, type) {
  //console.log(file)
  //creates a temp item to build pseudo link on for download
  var a = window.document.createElement('a');
  a.href = window.URL.createObjectURL(new Blob([file], {
    type: type
  }));
  a.download = name;
  // Append anchor to body.
  document.body.appendChild(a)
  //click it and fire the download
  a.click();
  //set a timout and then remove the a
  setTimeout(function() {
    // Remove anchor from body
    document.body.removeChild(a)
  }, 1000);

}


buildWqQuery = function(allDates) {
  console.log(allDates)
  if (allDates == true) {
    minDate = $('#minDateInput').val()
    maxDate = $('#maxDateInput').val()
    var queryUrl = serverRoot + 'db/queryDailyWq?minDate=' + minDate + '&maxDate=' + maxDate + '&region=' + currentRegion + '&justbor=' + justBor
    if (selectedSite) {
      queryUrl += ' &monitoringlocationidentifier=' + selectedSite.properties.monitoringlocationidentifier
      queryWqData(queryUrl)
      // return true;
    }
    if (selectedHuc) {
      queryUrl += ' &huc=' + selectedHuc;
    }
    queryDailyWqData(queryUrl)
    return true;
  } else {
    minDate = $('#minDateInput').val()
    maxDate = $('#maxDateInput').val()
    var queryUrl = serverRoot + 'db/queryWq?minDate=' + minDate + '&maxDate=' + maxDate + '&region=' + currentRegion + '&justbor=' + justBor
    if (selectedSite) {
      queryUrl += ' &monitoringlocationidentifier=' + selectedSite.properties.monitoringlocationidentifier
      queryWqData(queryUrl)
      return true;
    }
    if (selectedHuc) {
      queryUrl += ' &huc=' + selectedHuc;
    }
    queryWqData(queryUrl)
  }
}

getSites = function(withData) {
  axios.get(serverRoot + 'db/getSites?withData=' + withData + '&region=' + currentRegion + '&justbor=' + justBor + '&justph=' + justPh)
    .then(function(response) {
      console.log('got sites data')
      // console.log(response.data)
      processSitesData(response.data);
    })
    .catch(function(error) {})
}

getClams = function() {
  axios.get(serverRoot + 'db/getSites?withData=true&region=clams&justbor=' + justBor)
    .then(function(response) {
      clamsData = response.data[0]['row_to_json'];
      mapClams();
    })
    .catch(function(error) {
      console.log(error)
      console.log('error getting clams data')
      // clamsData=clamsDataRaw
      // mapClams();
    })
}

sitesData = {
  'type': 'FeatureCollection',
  "features": []
}

var sitesForTableFilter = []

function processSitesData(sitesDataRaw) {

  sitesForTableFilter = []

  sitesData = {
    'type': 'FeatureCollection',
    "features": []
  }

  metadataObject.totalSites = sitesDataRaw.length;
  $.each(sitesDataRaw, function(i, site) {
    sitesForTableFilter.push(site.monitoringlocationidentifier)
    var thisSite = {
      "type": "Feature",
      "properties": {
        "organizationidentifier": site.organizationidentifier,
        "huceightdigitcode": Number(site.huceightdigitcode),
        "organizationformalname": site.organizationformalname,
        "justPhData": site.arethereonlyph,
        "isbor": site.isbor,
        "monitoringlocationtypename": site.monitoringlocationtypename,
        "monitoringlocationidentifier": site.monitoringlocationidentifier,
        "id": site.monitoringlocationidentifier,
        "monitoringlocationname": site.monitoringlocationname,
        "reachcode": site.nearstream,
        "streamdist": site.streamdist,
        "phScore": Math.floor(Math.random() * 4),
        "caScore": Math.floor(Math.random() * 4)
      },
      "geometry": {
        "coordinates": [site.longitudemeasure, site.latitudemeasure],
        "type": "Point"
      }
    }
    sitesData.features.push(thisSite)
  })
  // if (map.getSource('sitesSource')) {
  if (mapReady) {
    console.log('yes just showing bor')
    map.getSource('sitesSource').setData(sitesData)
    if (avgTable) {
      avgTable.setFilter([
        {
          field: "monitoringlocationidentifier",
          type: "in",
          value: sitesForTableFilter
        }, //name must be steve, bob or jim
      ]);
    }
  } else {
    mapInits();
  }

}
