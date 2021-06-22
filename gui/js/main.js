// Make a request for a user with a given ID
$(document).ready(function() {
  if (window.location.hash) {
    var thisHash = window.location.hash.split('#')[1]
    if (thisHash == 'gye' | thisHash == 'crb' | thisHash == 'usr') {
      currentRegion = thisHash;
      if (thisHash == 'crb') {
        $('#titleMain').html("<div id='titleMain' class='titleText'>COLUMBIA RIVER BASIN</div>")
        flowlinesFilter = [">", ["to-number", ["get", "REACHCODE"]], 17000000000000]
      }
      if (thisHash == 'gye') {
        $('#titleMain').html("<div id='titleMain' class='titleText'>GREATER YELLOWSTONE ECOSYSTEM</div>")
        flowlinesFilter = ['any', ["<", ["to-number", ["get", "REACHCODE"]], 17000000000000],
          ["==", ["get", "region"], currentRegion]
        ]
        // flowlinesFilter=["==", "region", currentRegion]
        // flowlinesFilter=["<", ["to-number",["get","REACHCODE"]], 17000000000000]
        // flowlinesFilter=["all",flowlinesFilterUno,flowlinesFilterDos]
      }
      if (thisHash == 'usr') {
        flowlinesFilter = ['all', [">", ["to-number", ["get", "REACHCODE"]], 17040100000000],
          ["<", ["to-number", ["get", "REACHCODE"]], 17040221000000]
        ]
      }
    } else {
      M.Toast.dismissAll();
      M.toast({
        html: 'invalid regional parameter specified'
      })
      return true;
    }
  } else {
    M.Toast.dismissAll();
    M.toast({
      html: 'no regional parameter specified'
    })
    return true;
  }
  getSites(true);
  uiInits();
  buildWqQuery(false);
})


function uiInits() {

  $('#videoOverlay').click(function() {
    $('.videoCover').hide();
  })

  // build map legend
  var theseRisks = Object.keys(gradientColors).reverse()
  // $.each(theseRisks,function(i,thisRisk){
  //   var legendItem=''
  //   if(i==0){
  //     legendItem+="<div class='legendSubtitle'>HIGHER</div>"
  //   }
  //   var thisColor=gradientColors[thisRisk]
  //   legendItem+="<div class='legendItemBox'>"
  //   legendItem+="<div class='mapLegendBox' style='background-color:"+thisColor+"'></div>"
  //   // legendItem+="<div class='legendItemLabel'>"+thisRisk+"</div></div>"
  //   legendItem+="<div class='legendItemLabel'></div></div>"
  //   if(i==6){
  //     legendItem+="<div class='legendSubtitle'>LOWER</div>"
  //   }
  //
  //   $('#mapLegend').append(legendItem)
  // })


  $('.thresholdSelect').each(function() {
    var thisAnalyte = $(this).attr('name')
    var thisClass = $(this).attr('data-attr')
    var tempValue = thresholdsObject[thisAnalyte][thisClass]
    $(this).val(tempValue);
    // if(thisAnalyte=='ph'){
    //
    // }else{
    //   var thisClass=$(this).attr('data-attr')
    //   var tempValue=thresholdsObject[thisAnalyte][thisClass]
    //   $(this).val(tempValue);
    // }
  })

  $('#confidenceSelect').change(function() {
    tempThreshold = $(this).val();
    groupSitesByRisk();
  })

  $('#siteTypeSelect').change(function() {
    var siteTypes = $(this).val();
    var sitesFilter = ['in', 'monitoringlocationtypename']
    if (siteTypes.indexOf('streams') > -1) {
      sitesFilter.push('River/Stream')
      sitesFilter.push('Stream: Tidal stream')
      sitesFilter.push('Stream: Ditch')
      sitesFilter.push('River/stream Effluent-Dominated')
      sitesFilter.push('Stream: Canal')
      sitesFilter.push('Stream')
    }
    if (siteTypes.indexOf('lakes') > -1) {
      sitesFilter.push('Lake')
      sitesFilter.push('Reservoir')
      sitesFilter.push('Lake, Reservoir, Impoundment')
    }
    map.setFilter('sitesWithData', sitesFilter)
  })




  $('.thresholdSelect').change(function() {
    var thisAnalyte = $(this).attr('name')
    var thisClass = $(this).attr('data-attr')
    var thisValue = Number($(this).val());
    if (thisAnalyte == 'ph') {
      var existingValue = thresholdsObject[thisAnalyte][thisClass]
      var existingLow = thresholdsObject[thisAnalyte].low
      var existingMedium1Low = thresholdsObject[thisAnalyte].medium1Low
      var existingMedium1High = thresholdsObject[thisAnalyte].medium1High
      var existingMedium2Low = thresholdsObject[thisAnalyte].medium2Low
      var existingMedium2High = thresholdsObject[thisAnalyte].medium2High
      var existingHighLow = thresholdsObject[thisAnalyte].highLow
      var existingHighHigh = thresholdsObject[thisAnalyte].highHigh

      if (thisClass == 'medium1Low') {
        if (thisValue >= existingMedium1High) {
          M.Toast.dismissAll();
          M.toast({
            html: 'medium1low ' + thisAnalyte + ' value cannot exceed medium1high ' + thisAnalyte + ' value'
          })
          $(this).val(existingValue)
          return true;
        }
        thresholdsObject[thisAnalyte][thisClass] = thisValue
        groupSitesByRisk();
      }
      if (thisClass == 'medium1High') {
        if (thisValue <= existingMedium1Low) {
          M.Toast.dismissAll();
          M.toast({
            html: 'medium1High ' + thisAnalyte + ' value cannot be less than medium1low ' + thisAnalyte + ' value'
          })
          $(this).val(existingValue)
          return true;
        }
        thresholdsObject[thisAnalyte][thisClass] = thisValue
        groupSitesByRisk();
      }
      if (thisClass == 'medium2Low') {
        if (thisValue >= existingMedium2High) {
          M.Toast.dismissAll();
          M.toast({
            html: 'medium2low ' + thisAnalyte + ' value cannot exceed medium2high ' + thisAnalyte + ' value'
          })
          $(this).val(existingValue)
          return true;
        }
        thresholdsObject[thisAnalyte][thisClass] = thisValue
        groupSitesByRisk();
      }
      if (thisClass == 'medium2High') {
        if (thisValue <= existingMedium2Low) {
          M.Toast.dismissAll();
          M.toast({
            html: 'medium2High ' + thisAnalyte + ' value cannot be less than medium2low ' + thisAnalyte + ' value'
          })
          $(this).val(existingValue)
          return true;
        }
        thresholdsObject[thisAnalyte][thisClass] = thisValue
        groupSitesByRisk();
      }

      if (thisClass == 'highLow') {
        if (thisValue >= existingHighHigh) {
          M.Toast.dismissAll();
          M.toast({
            html: 'high low ' + thisAnalyte + ' value cannot exceed high high ' + thisAnalyte + ' value'
          })
          $(this).val(existingValue)
          return true;
        }
        thresholdsObject[thisAnalyte][thisClass] = thisValue
        groupSitesByRisk();
      }
      if (thisClass == 'highHigh') {
        if (thisValue <= existingHighLow) {
          M.Toast.dismissAll();
          M.toast({
            html: 'high high ' + thisAnalyte + ' value cannot be less than high low ' + thisAnalyte + ' value'
          })
          $(this).val(existingValue)
          return true;
        }
        thresholdsObject[thisAnalyte][thisClass] = thisValue
        groupSitesByRisk();
      }



    } else {
      var existingValue = thresholdsObject[thisAnalyte][thisClass]
      var existingLow = thresholdsObject[thisAnalyte].low
      var existingMedium = thresholdsObject[thisAnalyte].medium
      var existingHigh = thresholdsObject[thisAnalyte].high
      if (thisClass == 'low') {
        M.Toast.dismissAll();
        M.toast({
          html: 'low value cannot be changed'
        })
        $(this).val(0)
        // if(thisValue>=existingMedium){
        //   M.toast({html: 'low '+thisAnalyte+' value cannot exceed medium or high '+thisAnalyte+' value'})
        //   $(this).val(existingValue)
        // }else{
        //   thresholdsObject[thisAnalyte][thisClass]=thisValue
        //   groupSitesByRisk();
        // }
      }
      if (thisClass == 'medium') {
        if (thisValue <= existingLow) {
          M.Toast.dismissAll();
          M.toast({
            html: 'medium ' + thisAnalyte + ' value cannot be less than low ' + thisAnalyte + ' value'
          })
          $(this).val(existingValue)
          return true;
        }
        if (thisValue >= existingHigh) {
          M.Toast.dismissAll();
          M.toast({
            html: 'medium ' + thisAnalyte + ' value cannot exceed high ' + thisAnalyte + ' value'
          })
          $(this).val(existingValue)
          return true;
        }
        thresholdsObject[thisAnalyte][thisClass] = thisValue
        groupSitesByRisk();
      }
      if (thisClass == 'high') {
        if (thisValue <= existingMedium) {
          M.Toast.dismissAll();
          M.toast({
            html: 'high ' + thisAnalyte + ' value cannot be less than medium ' + thisAnalyte + ' value'
          })
          $(this).val(existingValue)
        } else {
          thresholdsObject[thisAnalyte][thisClass] = thisValue
          groupSitesByRisk();
        }
      }

    }
  })



  $('.modal').modal({
    onCloseEnd: function() { // Callback for Modal close
      // alert('Closed');
      // buildWqQuery(false);
    }
  });
  // $('.modal').modal('open');

  $('#advancedOptionsButton').click(function() {
    $('.modal').modal('open');
  })

  $('.disabled').click(function() {
    M.Toast.dismissAll();
    M.toast({
      html: 'this feature is not yet available'
    })
  })

  $(document).ready(function() {
    $('select').formSelect();
  });

  var docWidth = $(document).width();
  var docHeight = $(document).height();

  var maxDate = new Date();
  maxDate.setMinutes(maxDate.getMinutes() - maxDate.getTimezoneOffset());
  maxDate = maxDate.toJSON().slice(0, 10);
  maxDateInit = maxDate;
  $('#maxDateInput').val(maxDate);

  minDate = new Date()
  minDate.setDate(minDate.getDate() - 365)
  minDate = minDate.toJSON().slice(0, 10);
  minDateInit = minDate;
  $('#minDateInput').val(minDate);


  phSampleTimeoutDebounce = null
  $('#phSampleSizeInput').change(function() {
    minPhSampleSize = $(this).val()
    if (phSampleTimeoutDebounce) {
      clearTimeout(phSampleTimeoutDebounce)
    }
    phSampleTimeoutDebounce = setTimeout(() => {
      console.log('new min ph sample size of ' + minPhSampleSize)
      groupSitesByRisk();
    }, 500)
  })

  caSampleTimeoutDebounce = null
  $('#caSampleSizeInput').change(function() {
    minCaSampleSize = $(this).val()
    if (caSampleTimeoutDebounce) {
      clearTimeout(caSampleTimeoutDebounce)
    }
    caSampleTimeoutDebounce = setTimeout(() => {
      console.log('new min ca sample size of ' + minCaSampleSize)
      groupSitesByRisk();
    }, 500)
  })


  dateTimeoutDebounce = null
  $('.dateSelect').change(function() {
    minDateTemp = $('#minDateInput').val()
    maxDateTemp = $('#maxDateInput').val()
    if (dateTimeoutDebounce) {
      clearTimeout(dateTimeoutDebounce)
    }

    dateTimeoutDebounce = setTimeout(() => {
      console.log("Checking the date!")
      if (minDateTemp >= maxDateTemp) {
        M.Toast.dismissAll();
        M.toast({
          html: 'Min date cannot be equal to or exceed max date'
        })
        $('#minDateInput').val(minDateInit)
        $('#maxDateInput').val(maxDateInit)
        // return true
      } else {
        minDate = minDateTemp;
        maxDate = maxDateTemp;
        buildWqQuery(false);
      }
    }, 1000)
  })



  $('#map').on('mousemove', function(e) {
    if (e.pageX > docWidth / 2) {
      xOffset = -$('#hoverInfoBox').width() - 30
    } else {
      xOffset = 20
    }
    if (e.pageY > docHeight / 2) {
      yOffset = -$('#hoverInfoBox').height() - 30
    } else {
      yOffset = 20
    }
    $('#hoverInfoBox').css({
      left: e.pageX + xOffset,
      top: e.pageY + yOffset
    });
  });

  // $('#clearDrawingButton').click(function() {
  //   clearDrawingEvent();
  // })

  $('#queryTypeSelect').change(function() {
    selectMode = $(this).val()
    unselectAllFeatures();
    map.getCanvas().style.cursor = "";
    // if (selectMode == 'polygon') {
    //   startPolygonDrawing();
    // }
    if (selectMode == 'all') {
      unselectAllFeatures();
      buildWqQuery(false);
    }
  })

  $('#extendSelect').change(function() {
    if ($(this).val() == 'true') {
      extendSegments = true;
    } else {
      extendSegments = false;
    }
    groupSitesByRisk();
  })


  $('#selectedMetricSelect').change(function() {
    selectedMetric = $(this).val()
    groupSitesByRisk();
  })

  $('#borSelect').change(function() {
    // if($(this).val()=='true'){
    //   map.setLayoutProperty('justBorSitesLayer','visibility','visible')
    // }else{
    //   map.setLayoutProperty('justBorSitesLayer','visibility','none')
    // }
    justBor = $(this).val()
    getSites();
    // unselectAllFeatures();
    // buildWqQuery(false);
  })

  $('#phNoCaSelect').change(function() {
    justPh = $(this).val()
    getSites();
    // if($(this).val()=='true'){
    //   map.setLayoutProperty('sitesWithPhAndNoCa','visibility','visible')
    // }else{
    //   map.setLayoutProperty('sitesWithPhAndNoCa','visibility','none')
    // }
  })

  $('#clamSelect').change(function() {
    if ($(this).val() == 'true') {
      toggleClams(true)
    } else {
      toggleClams(false)
    }
    // unselectAllFeatures();
    // buildWqQuery(false);


  })





  $('#resultsTypeSelect').change(function() {
    resultsType = $(this).val()
    if (resultsType == 'nhd') {
      groupSitesByRisk()
      nhdMapRender()
    }
    if (resultsType == 'sites') {
      groupSitesByRisk()
      sitesMapRender()
    }
  })

  $('#downloadDailyData').click(function() {
    buildWqQuery(true)
  })





  $('#changeDatesButton').click(function() {
    if (minDate >= maxDate) {
      M.Toast.dismissAll();
      M.toast({
        html: 'Min date cannot be equal to or exceed max date'
      })
      return true
    } else {
      buildWqQuery(false);
    }
  })

  $('#downloadTable').click(function() {
    minDate = $('#minDateInput').val()
    maxDate = $('#maxDateInput').val()
    avgTable.download('csv', minDate + '_' + maxDate + '_AveragedResults.csv')
  })


  $('#runQueriesButton').click(function() {
    // minDate=$('#minDateInput').val()
    // maxDate=$('#maxDateInput').val()
    // if(minDate>=maxDate){
    //   M.toast({html: 'Min date cannot be equal to or exceed max date'})
    //   return true
    // }else{
    //   queryWqData();
    // }
  })

  // queryWqData()
}

tableUpdate = function() {
  $('.progress').hide()
  if (avgTable) {
    avgTable.setData(returnedData.avgData)
  }
  renderMetadata();
  if ($('#map').css('pointer-events') == 'none') {
    $('#map').css('pointer-events', 'all')
  }
}

var tablesHolder = {}

tableInit = function() {

  columnsAvg = [];


  var sampleKeysAvg = Object.keys(returnedData.avgData[0])





  var avgColumns = ['monitoringlocationidentifier', 'phmean', 'tempmean', 'camean', 'phcnt', 'cacnt', 'tempcnt']
  // dropCols=[]

  $.each(sampleKeysAvg, function(i, item) {
    tempObj = {
      title: item,
      field: item
    }
    if (avgColumns.indexOf(item) > -1) {
      columnsAvg.push(tempObj)
    }
  })


  avgTable = new Tabulator("#avgTable", {
    height: "50%",
    layout: "fitData",
    layoutColumnsOnNewData: true,
    index: "masterdate",
    columns: columnsAvg,
    pagination: 'local',
    paginationSize: 100,
    rowMouseOver: function(e, row) {
      e.stopPropagation()
      rowHoverHandler(row)
    },
    rowClick: function(e, row) {
      rowClickHandler(row)
    },
    rowMouseOut: function(e, row) {
      map.setFilter('sitesHovered', ['==', 'monitoringlocationidentifier', -1])
    }
  })



  tableUpdate()

}

function rowClickHandler(row) {
  var thisSiteId = row._row.data.monitoringlocationidentifier;
  $.each(sitesData.features, function(i, thisSite) {
    if (thisSite.properties.monitoringlocationidentifier == thisSiteId) {
      map.flyTo({
        center: thisSite.geometry.coordinates,
        zoom: 6.55,
        easing: function(t) {
          return t;
        },
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      });
      return true;
    }
  })
  // $.each(function(i,thisSite){
  //   $.each(sitesData.
  // })
}

function rowHoverHandler(row) {
  // console.log()
  map.setFilter('sitesHovered', ['==', 'monitoringlocationidentifier', row._row.data.monitoringlocationidentifier])
}

function dateFormatter(dateIn) {
  var year = dateIn.substring(0, 4);
  var month = dateIn.substring(4, 6);
  var day = dateIn.substring(6, 8);
  var hour = dateIn.substring(8, 10);
  var minute = dateIn.substring(10, 12);
  return (month + '/' + day + '/' + year + ' ' + hour + ":" + minute)
}

renderMetadata = function() {
  metadataString = '<div class="col s6">'
  metadataString += '<span class="redHighlight left">Last checked for updates: ' + dateFormatter(metadataObject.lastUpdated.lastupdated) + '</span><br>'
  metadataString += '<span class="redHighlight left">Newest data in system: ' + dateFormatter(metadataObject.lastDataAdded.lastupdated) + '</span><br>'
  metadataString += '<span class="redHighlight left">Total rows in database: ' + metadataObject.lastUpdated.totalobs + '</span><br>'
  metadataString += '<span class="redHighlight left">Total sites in datebase: ' + metadataObject.totalSites + '</span>'
  metadataString += '</div>'
  metadataString += '<div class="col s6">'
  metadataString += '<span class="redHighlight right">Total rows in current query: ' + metadataObject.currentRows + '</span><br>'
  // metadataString += '<span class="redHighlight right">Total sites in current query: ' + metadataObject.currentSites + '</span><br>'

  metadataString += '</div>'
  $('#metadataPanel').html(metadataString)
}

hoverHandler = function(props, type) {
  if (type == 'clams') {
    console.log(props)
    var hoverString = '<span class="hoverTitle">' + props['common nam'] + '</span><br>'
    hoverString += '<span class="hoverBody">Location: ' + props['locality'] + '</span><br>'
    hoverString += '<span class="hoverBody">Year: ' + props['year'] + '</span>'
    $('#hoverInfoBox').html(hoverString)
    $('#hoverInfoBox').show()
  }
  if (type == 'nhd') {
    var hoverString = '<span class="hoverTitle">' + props.GNIS_NAME + '</span><br>'
    hoverString += '<span class="hoverBody">' + props.LENGTHKM + ' km</span><br>'
    if (sitesLookup[props.REACHCODE]) {
      var thisSiteData = sitesLookup[props.REACHCODE]
      hoverString += '<span class="hoverBody">This site has an infered pH risk score of ' + thisSiteData.phScore + ' and a ca score of ' + thisSiteData.caScore + '</span><br>'
    }
    // if (siteGroups.low.indexOf(props.REACHCODE) > -1) {
    //   hoverString += '<br><span class="hoverBody">this segment has a low ais risk as inferred from ' + selectedMetric + ' measure at nearby monitoring site ' + sitesLookup[Number(props.REACHCODE)].monitoringlocationidentifier + '</span><br>'
    // }
    // if (siteGroups.medium.indexOf(props.REACHCODE) > -1) {
    //   hoverString += '<br><span class="hoverBody">this segment has a medium ais risk as inferred from ' + selectedMetric + ' measure at nearby monitoring site ' + sitesLookup[Number(props.REACHCODE)].monitoringlocationidentifier + '</span><br>'
    // }
    // if (siteGroups.high.indexOf(props.REACHCODE) > -1) {
    //   hoverString += '<br><span class="hoverBody">this segment has a high ais risk as inferred from ' + selectedMetric + ' measure at nearby monitoring site ' + sitesLookup[Number(props.REACHCODE)].monitoringlocationidentifier + '</span><br>'
    // }
    $('#hoverInfoBox').html(hoverString)
    $('#hoverInfoBox').show()
  }
  if (type == 'huc') {
    var hoverString = '<span class="hoverTitle">' + props.NAME + '</span><br>'
    hoverString += '<span class="hoverBody">' + Math.floor(Number(props.AREAACRES)).toLocaleString() + ' acres</span><br>'
    $('#hoverInfoBox').html(hoverString)
    $('#hoverInfoBox').show()
  }
  if (type == 'site') {
    var hoverString = '<span class="hoverBody">' + props.monitoringlocationname + '</span><br>'
    hoverString += '<span class="hoverBody">' + props.monitoringlocationidentifier + '</span><br>'
    hoverString += '<span class="hoverBody">' + props.organizationformalname + '</span><br>'
    hoverString += '<span class="hoverBody">' + props.monitoringlocationtypename + '</span>'
    if (sitesLookup[props.reachcode]) {
      var thisSiteData = sitesLookup[props.reachcode]
      hoverString += '<br><span class="hoverBody">This site has a pH risk score of ' + thisSiteData.phScore + ' and a ca score of ' + thisSiteData.caScore + '</span><br>'
    }
    $('#hoverInfoBox').html(hoverString)
    $('#hoverInfoBox').show()
  }

}



var extendSegments = true;

var flowlinesStatesSet = [];
var sitesStatesSet = [];

function undoFeatureStates() {
  $.each(flowlinesStatesSet, function(i, thisFlowline) {
    map.removeFeatureState({
      source: 'flowlines4PlusSource',
      sourceLayer: sourceLayersConfig.flowlines4Plus.sourceLayer,
      id: thisFlowline
    })
    map.removeFeatureState({
      source: 'flowlines3MinusSource',
      sourceLayer: sourceLayersConfig.flowlines3Minus.sourceLayer,
      id: thisFlowline
    })
  })

  $.each(sitesStatesSet, function(i, thisSite) {
    map.removeFeatureState({
      source: 'sitesSource',
      id: thisSite
    })
  })

  flowlinesStatesSet = [];
  sitesStatesSet = [];
}

var sitesLookup = {}



groupSitesByRisk = function() {

  // if(!map.getSource('sitesSource')){
  console.log(mapReady)
  if(!mapReady){
    console.log("still waiting for source to be ready")
    setTimeout(function(){
      groupSitesByRisk();
    },
      1000);
      return true;
  }

  sitesVisible = []

  undoFeatureStates();

  var keyToCheck = selectedMetric + "mean";

  filterTable();

  if (resultsType == 'sites') {
    var dataToDraw = returnedData.avgData
  } else {
    var dataToDraw = returnedData.avgDataJoined
  }


  $.each(dataToDraw, function(i, site) {
    // if(selectedMetric=='ph'){
    if (minPhSampleSize > 1) {
      if (Number(site.phcnt) < minPhSampleSize) {
        return true;
      }
    }
    // }

    // if(selectedMetric=='ca'){
    if (minCaSampleSize > 1) {
      if (Number(site.cacnt) < minCaSampleSize) {
        return true;
      }
    }

    if(!site.cacnt){
      return true;
    }

    if(!site.phcnt){
      return true;
    }
    // }




    if (tempThreshold != 'none') {
      if (Number(site.tempmean) < thresholdsObject.temp.medium || Number(site.tempmean) > thresholdsObject.temp.high) {
        return true;
      }
    }

    var thisPhValue = Number(site.phmean);
    var thisCaValue = Number(site.camean);

    // site.phScore = -10;
    // site.caScore = -10;



    // if (site.nearstream) {
    sitesLookup[site.nearstream] = site;
    var streamSegmentsToDraw = [site.reachcode]
    if (resultsType == 'nhd' && extendSegments) {
      if (site.oneup) {
        sitesLookup[site.oneup.trim()] = site;
        streamSegmentsToDraw.push(site.oneup.trim())
      }

      if (site.onedown) {
        sitesLookup[site.onedown.trim()] = site;
        streamSegmentsToDraw.push(site.onedown.trim())
      }

      if (site.twoup) {
        sitesLookup[site.twoup.trim()] = site;
        streamSegmentsToDraw.push(site.twoup.trim())
      }

      if (site.twodown) {
        sitesLookup[site.twodown.trim()] = site;
        streamSegmentsToDraw.push(site.twodown.trim())
      }
    }

    if (thisPhValue!=null && thisPhValue < thresholdsObject.ph.medium1Low || thisPhValue!=null && thisPhValue > thresholdsObject.ph.highHigh) {
      // site.phScore+=1;
      site.phScore = 0.01;
    } else if (
      thisPhValue!=null && thisPhValue < thresholdsObject.ph.medium1High &&
      thisPhValue >= thresholdsObject.ph.medium1Low ||
      thisPhValue!=null && thisPhValue < thresholdsObject.ph.medium2High &&
      thisPhValue >= thresholdsObject.ph.medium2Low
    ) {
      // site.phScore+=2;
      site.phScore = 0.1;
    } else if (thisPhValue!=null && thisPhValue >= thresholdsObject.ph.highLow && thisPhValue < thresholdsObject.ph.highHigh) {
      // site.phScore+=3;
      site.phScore = 1;
    }

    if (thisCaValue!=null && thisCaValue < thresholdsObject.ca.medium) {
      // site.caScore+=1
      // console.log(thisCaValue)
      site.caScore = 0.01
    }

    if (
      thisCaValue!=null && thisCaValue < thresholdsObject.ca.high &&
      thisCaValue >= thresholdsObject.ca.medium
    ) {
      // site.caScore+=2
      site.caScore = 0.1
    }

    if (thisCaValue!=null && thisCaValue >= thresholdsObject.ca.high) {
      // site.caScore+=3
      site.caScore = 1
    }
    // }



    if (selectedMetric == 'ph') {
      drawScore = site.phScore
    }
    if (selectedMetric == 'ca') {
      drawScore = site.caScore
      // drawScore=1;
    }
    if (selectedMetric == 'caph') {
      // drawScore=site.caScore+site.phScore
      drawScore = site.caScore * site.phScore
    }



    // console.log(drawScore)

    if (drawScore > 0) {
      sitesVisible.push(site.monitoringlocationidentifier)
    }

    if(site.monitoringlocationidentifier=='1119USBR_WQX-AFE200'){
      jj=site;
    }



    if (resultsType == 'sites') {

      sitesStatesSet.push(site.monitoringlocationidentifier)

      map.setFeatureState({
        source: 'sitesSource',
        id: site.monitoringlocationidentifier
      }, {
        drawColor: drawScore
      })
    } else {



      $.each(streamSegmentsToDraw, function(i, reachCodeToDraw) {

        flowlinesStatesSet.push(reachCodeToDraw)

        map.setFeatureState({
          source: 'flowlines4PlusSource',
          sourceLayer: sourceLayersConfig.flowlines4Plus.sourceLayer,
          id: reachCodeToDraw
        }, {
          drawColor: drawScore
        })
        map.setFeatureState({
          source: 'flowlines3MinusSource',
          sourceLayer: sourceLayersConfig.flowlines3Minus.sourceLayer,
          id: reachCodeToDraw
        }, {
          drawColor: drawScore
        })
      })
    }

  });

  // drawRiskSites(siteGroups);
  $('.progress').hide()
}



function filterTable() {

  tableFilters = []

  // if(selectedMetric=='ph'){
  if (Number(minPhSampleSize) > 1) {
    var phFilter = {
      field: "phcnt",
      type: ">",
      value: Number(minPhSampleSize)
    }
    tableFilters.push(phFilter)
  }
  // }

  // if(selectedMetric=='ca'){
  if (Number(minCaSampleSize) > 1) {
    var caFilter = {
      field: "cacnt",
      type: ">",
      value: Number(minCaSampleSize)
    }
    tableFilters.push(caFilter)
  }
  // }




  if (tempThreshold != 'none') {

    var tempFilter = {
      field: "tempmean",
      type: ">",
      value: thresholdsObject.temp.medium
    }
    tableFilters.push(tempFilter)

    var tempFilter = {
      field: "tempmean",
      type: "<",
      value: thresholdsObject.temp.high
    }
    tableFilters.push(tempFilter)

  }

  if (tableFilters.length > 0) {
    avgTable.setFilter(tableFilters)
  } else {
    avgTable.clearFilter();
  }




}
