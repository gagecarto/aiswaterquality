

mapInits=function() {
  mapboxgl.accessToken = "";
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/outdoors-v11",
    center: [-114.744, 45.312],
    // center: [-123.11,46.65],
    zoom: 4,
    maxZoom:15
  });


  map.on('zoomend', function() {
    var thisZoom = map.getZoom();
    if (thisZoom > 6.5) {
      if (zoomStatus == 'small') {
        zoomStatus = 'big';
        map.setPaintProperty('sitesWithData', 'circle-opacity', riskDrawCaseSitesOpacityBigZoom)
        map.setPaintProperty('flowlines3MinusWithData', 'line-opacity', riskDrawCaseNhdBigZoom)
        map.setPaintProperty('flowlines4PlusWithData', 'line-opacity', riskDrawCaseNhdBigZoom)
      }
    } else {
      if (zoomStatus == 'big') {
        zoomStatus = 'small';
        map.setPaintProperty('sitesWithData', 'circle-opacity', riskDrawCaseSitesOpacitySmallZoom)
        map.setPaintProperty('flowlines3MinusWithData', 'line-opacity', riskDrawCaseNhdSmallZoom)
        map.setPaintProperty('flowlines4PlusWithData', 'line-opacity', riskDrawCaseNhdSmallZoom)
      }
    }
  })




  if (currentRegion == 'crb') {
    var mapbounds = [-125.642, 41.069, -109.199, 49.230]
  }
  if (currentRegion == 'gye') {
    var mapbounds = [-116.6524, 40.235, -98.590, 49.259]
  }
  if (currentRegion == 'usr') {
    var mapbounds = [-115.966, 41.38, -109.35, 44.794]
  }

  map.fitBounds(mapbounds)


  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());

  map.once("load", function() {
    console.log('loaded')
    mapReady=true;
    mapLayers = map.getStyle().layers;
    // getClams();
    addMapLayers();
    // mapLayersInit();
  });

  // drawInititalize();
}

var underLayer = "admin-1-boundary"

function addMapLayers() {

  map.setLayoutProperty('road-number-shield','visibility','none')

  map.addSource("flowlines4PlusSource", {
    type: "vector",
    url: sourceLayersConfig.flowlines4Plus.sourceUrl,
    promoteId: {
      crbgyeflowlines_4plus: 'REACHCODE'
    }
  });
  map.addSource("flowlines3MinusSource", {
    type: "vector",
    url: sourceLayersConfig.flowlines3Minus.sourceUrl,
    promoteId: {
      crbgyeflowlines_3minus: 'REACHCODE'
    }
  });

  map.addSource("nhdHoverSource", {
    "type": "geojson",
    // "data": {"type": "FeatureCollection", "features": []}
    "data": {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-110.71609497070312, 44.05601169578526],
          [-110.71746826171875, 44.048115730823525]
        ]
      }
    }
  });


  map.addLayer({
    "id": "nhdHoverPop",
    "type": "line",
    "source": "nhdHoverSource",
    "minzoom": 3,
    "layout": {
      "visibility": "visible",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#181449",
      "line-opacity": 0.65,
      "line-width": 16
    },
  }, underLayer)



  map.addLayer({
    id: "flowlines3Minus",
    type: "line",
    source: "flowlines3MinusSource",
    "source-layer": sourceLayersConfig.flowlines3Minus.sourceLayer,
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-color": "#1d81bf",
      // "line-color": riskDrawCaseNhd,
      "line-width": threeMinusLideWidth,
      "line-opacity": ["interpolate", ["linear"],
        ["zoom"], 7, 0, 8, 1
      ]
    },
    // filter: ["==", "region", currentRegion]
    filter: flowlinesFilter
  }, underLayer);
  map.addLayer({
    id: "flowlines4Plus",
    type: "line",
    source: "flowlines4PlusSource",
    "source-layer": sourceLayersConfig.flowlines4Plus.sourceLayer,
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-color": "#1d81bf",
      // "line-color": riskDrawCaseNhd,
      "line-width": fourPlusLineWidth
    },
    // filter: ["==", "region", currentRegion]
    filter: flowlinesFilter
  }, underLayer);

  map.addLayer({
    id: "flowlines3MinusWithData",
    type: "line",
    source: "flowlines3MinusSource",
    "source-layer": sourceLayersConfig.flowlines3Minus.sourceLayer,
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      // "line-color": "#1d81bf",
      "line-color": riskDrawCaseNhd,
      "line-opacity": riskDrawCaseNhdSmallZoom,
      "line-width": threeMinusLideWidthData,
      "line-opacity": ["interpolate", ["linear"],
        ["zoom"], 7, 0, 8, 1
      ]
    },
    // filter: ["==", "region", currentRegion]
    filter: flowlinesFilter
  }, underLayer);
  map.addLayer({
    id: "flowlines4PlusWithData",
    type: "line",
    source: "flowlines4PlusSource",
    "source-layer": sourceLayersConfig.flowlines4Plus.sourceLayer,
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      // "line-color": "#1d81bf",
      "line-color": riskDrawCaseNhd,
      "line-opacity": riskDrawCaseNhdSmallZoom,
      "line-width": fourPlusLineWidthData
    },
    // filter: ["==", "region", currentRegion]
    filter: flowlinesFilter
  }, underLayer);

  map.addLayer({
    id: "flowlines3MinusHover",
    type: "line",
    source: "flowlines3MinusSource",
    "source-layer": "crbgyeflowlines_3minus",
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-color": "#1d81bf",
      "line-width": 12,
      "line-opacity": 0
    },
    filter: flowlinesFilter
  }, underLayer);

  map.addLayer({
    id: "flowlines4PlusHover",
    type: "line",
    source: "flowlines4PlusSource",
    "source-layer": "crbgyeflowlines_4plus",
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-color": "#1d81bf",
      "line-width": 20,
      "line-opacity": 0
    },
    filter: flowlinesFilter
  }, underLayer);



  map.on("mouseover", 'flowlines4PlusHover', function(e) {
    // if(map.getLayoutProperty('flowlines4Plus','visibility')=='none'){
    //   return true;
    // }
    if (resultsType == 'sites') {
      return true;
    }
    map.getCanvas().style.cursor = 'pointer';
    streamHoverHandler(e.features[0].geometry.coordinates)
    hoverHandler(e.features[0].properties, 'nhd')
  });
  map.on("mouseover", 'flowlines3MinusHover', function(e) {
    // if(map.getLayoutProperty('flowlines3Minus','visibility')=='none'){
    //   return true;
    // }
    if (resultsType == 'sites') {
      return true;
    }
    if (map.getZoom() > 7.5) {
      map.getCanvas().style.cursor = 'pointer';
      streamHoverHandler(e.features[0].geometry.coordinates)
      hoverHandler(e.features[0].properties, 'nhd')
    }
  });

  map.on("mouseout", 'flowlines4PlusHover', function(e) {
    map.getCanvas().style.cursor = '';
    streamHoverHandler([])
    $("#hoverInfoBox").hide();
  });

  map.on("mouseout", 'flowlines3MinusHover', function(e) {
    map.getCanvas().style.cursor = '';
    streamHoverHandler([])
    $("#hoverInfoBox").hide();
  });


  mapLayersInit()

}

function streamHoverHandler(geom) {
  var thisGeoJson = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "LineString",
      "coordinates": geom
    }
  }
  map.getSource("nhdHoverSource").setData(thisGeoJson);

}


nhdMapRender=function() {
  map.setLayoutProperty("sitesWithData", "visibility", "none");
  map.setLayoutProperty("flowlines4PlusWithData", "visibility", "visible");
  map.setLayoutProperty("flowlines3MinusWithData", "visibility", "visible");
}

sitesMapRender=function() {
  map.setLayoutProperty("sitesWithData", "visibility", "visible");
  map.setLayoutProperty("flowlines4PlusWithData", "visibility", "none");
  map.setLayoutProperty("flowlines3MinusWithData", "visibility", "none");
}

addsitesToMap=function(){
    map.addSource("sitesSource", {
      type: "geojson",
      data: sitesData,
      promoteId: "monitoringlocationidentifier",
    });

    map.addLayer({
      id: "sitesHovered",
      type: "circle",
      source: "sitesSource",
      paint: {
        // make circles larger as the user zooms from z12 to z22
        "circle-radius": {
          base: 5,
          stops: [
            [12, 14],
            [22, 180]
          ]
        },
        "circle-color": "rgba(32, 0, 43, 1)",
        "circle-stroke-color": "rgb(4, 3, 8)",
        "circle-stroke-opacity": 1
      },
      filter: ["==", "monitoringlocationidentifier", -1]
    }, underLayer);

    map.addLayer({
      id: "sitesWithData",
      type: "circle",
      source: "sitesSource",
      layout: {
        // visibility: "none"
      },
      // filter: ["==", "monitoringlocationtypename", -1],
      paint: {
        // make circles larger as the user zooms from z12 to z22

        "circle-radius": riskDrawCaseSitesRadius,
        "circle-color": riskDrawCaseSitesColor,
        "circle-opacity": riskDrawCaseSitesOpacitySmallZoom,
        "circle-stroke-width": 0.25,
        "circle-stroke-color": riskDrawCaseSitesStroke

        // "circle-radius": 10,
        // "circle-color": 'rgb(0, 255, 3)'
      }
    }, "waterway-label");

    map.addLayer({
      id: "sitesWithPhAndNoCa",
      type: "circle",
      source: "sitesSource",
      layout: {
        visibility: "none",
      },
       filter: ["==", "justPhData", true],
      paint: {
        // make circles larger as the user zooms from z12 to z22
        "circle-radius": 10,
        "circle-color": 'rgb(0, 255, 0)',
      }
    }, "contour-line");

    map.addLayer({
      id: "justBorSitesLayer",
      type: "circle",
      source: "sitesSource",
      layout: {
        visibility: "none",
      },
       filter: ["==", "isbor", true],
      paint: {
        // make circles larger as the user zooms from z12 to z22
        "circle-radius": 8,
        "circle-color": 'rgb(238, 255, 0)',
      }
    }, "contour-line");

    map.setFilter('sitesWithData',['in','monitoringlocationtypename','Stream','Lake'])



    map.addLayer({
      id: "sitesSelected",
      type: "circle",
      source: "sitesSource",
      paint: {
        // make circles larger as the user zooms from z12 to z22
        "circle-radius": {
          base: 8,
          stops: [
            [12, 10],
            [22, 170]
          ]
        },
        "circle-color": "#550500"
      },
      filter: ["==", "monitoringlocationidentifier", -1]
    }, underLayer);

    map.on("click", "sitesWithData", function(e) {
      console.log("site with data clicked");
      if (
        hoveredSite &&
        selectedSite &&
        hoveredSite.properties.monitoringlocationidentifier ==
        selectedSite.properties.monitoringlocationidentifier
      ) {
        clearSitesSelected();
        buildWqQuery();
        return true;
      }
      selectedSite = hoveredSite;
      // hoveredSite=null;
      console.log("selected");
      map.setFilter("sitesSelected", [
        "==",
        "monitoringlocationidentifier",
        selectedSite.properties.monitoringlocationidentifier
      ]);
      buildWqQuery();
    });


  $('#siteTypeSelect').change()

}

mapLayersInit=function() {


  if (currentRegion == "crb") {
    var hucSourceUrl = "mapbox://adamsepulveda.46yqlfzm";
    var hucLayerName = "HUC8_17";
    var boundaryUrl = "mapbox://adamsepulveda.59j1dqmy";
    var boundaryLayer = "crbDslvd-7577re";
  }
  if (currentRegion == "gye") {
    var hucSourceUrl = "mapbox://adamsepulveda.6fln6dvt";
    var hucLayerName = "HUC8_GYE";
    var boundaryUrl = "mapbox://adamsepulveda.1l0b5z4z";
    var boundaryLayer = "gyeDslvd-a29mj0";
  }
  if (currentRegion == "usr") {
    var hucSourceUrl = "mapbox://adamsepulveda.1wakph2s";
    var hucLayerName = "HUC8_upperSnake-9q1lsy";
    var boundaryUrl = "mapbox://adamsepulveda.cx4jkykk";
    var boundaryLayer = "upperSnakeDissolved-7pve1j";
  }

  map.addSource("huc8source", {
    type: "vector",
    url: hucSourceUrl
  });

  map.addSource("boundarySource", {
    type: "vector",
    url: boundaryUrl
  });

  map.addSource("featureHoverSource", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  map.addSource("featureSelectedSource", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  map.addLayer({
      id: "huc8layer",
      type: "fill",
      source: "huc8source",
      "source-layer": hucLayerName,
      paint: {
        "fill-color": "rgb(41, 40, 213)",
        "fill-opacity": 0,
        "fill-opacity-transition": {
          duration: 250
        },
        "fill-outline-color": "rgba(43, 52, 116, 0)"
      }
    },
    underLayer
  );

  map.addLayer({
      id: "boundaryLayer",
      type: "line",
      source: "boundarySource",
      "source-layer": boundaryLayer,
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#230e42",
        "line-width": 7
      }
    },
    underLayer
  );

  map.addLayer({
    id: "featureHoverLayer",
    type: "fill",
    source: "featureHoverSource",
    paint: {
      "fill-color": "rgb(41, 40, 213)",
      "fill-opacity": 0.45,
      "fill-outline-color": "rgba(0, 0, 0, 0.5)"
    }
  }, underLayer);

  map.addLayer({
    id: "featureSelectedLayer",
    type: "line",
    source: "featureSelectedSource",
    paint: {
      "line-color": "#00d9ff",
      "line-width": 5
    }
  }, underLayer);


  //
  map.on("click", function(e) {
    if (!hoveredSite && selectedSite && selectMode == "all") {
      clearSitesSelected();
      buildWqQuery(false);
    }
  });
  //
  map.on("click", "huc8layer", function(e) {
    // if(selectedSite && selectMode=='all'){
    //   clearSitesSelected();
    //   return true;
    // }
    if (selectMode != "huc" | hoveredSite) {
      console.log("exit huc click");
      return true;
    }
    console.log("huc clicked");
    // if just clicked within already selected hu
    if (hoverFeature.properties.HUC8 == selectedHuc) {
      // if hovering over a site.. do nothing
      if (hoveredSite) {
        return true;
      }
      // if a site is not selecting then deselct the entire huc
      if (!selectedSite) {
        unselectAllFeatures();
        return true;
      }
    }
    if (selectedHucBounds) {
      selectedHuc = hoverFeature.properties.HUC8;
      map.getSource("featureSelectedSource").setData(selectedHucBounds);
      map
        .getSource("featureHoverSource")
        .setData({
          type: "FeatureCollection",
          features: []
        });
      if (selectedSite) {
        clearSitesSelected();
      }
      buildWqQuery();
    } else {
      map
        .getSource("featureSelectedSource")
        .setData({
          type: "FeatureCollection",
          features: []
        });
    }
  });

  map.on("mouseout", "huc8layer", function(e) {
    map
      .getSource("featureHoverSource")
      .setData({
        type: "FeatureCollection",
        features: []
      });
    map.getCanvas().style.cursor = "";
    // selectedHucBounds=null;
    // selectedHuc=null;
    $("#hoverInfoBox").hide();
  });

  map.on("mousemove", "huc8layer", function(e) {
    if (selectMode != "huc") {
      return true;
    }
    hoverFeature = e.features[0];
    if (hoverFeature.properties.HUC8 == selectedHuc) {
      map
        .getSource("featureHoverSource")
        .setData({
          type: "FeatureCollection",
          features: []
        });
      $("#hoverInfoBox").hide();
      return true;
    }
    map.getCanvas().style.cursor = "pointer";
    var relatedFeatures = map.querySourceFeatures("huc8source", {
      sourceLayer: hucLayerName,
      filter: ["in", "HUC8", hoverFeature.properties.HUC8]
    });
    selectedHucBounds = {
      type: "FeatureCollection",
      features: relatedFeatures.map(function(f) {
        return {
          type: "Feature",
          geometry: f.geometry
        };
      })
    };
    selectedHucBounds = turf.union.apply(this, selectedHucBounds.features);
    map.getSource("featureHoverSource").setData(selectedHucBounds);
    hoverHandler(e.features[0].properties, "huc");
  });
  //
  map.on("mouseout", "sitesHovered", function(e) {
    hoveredSite = null;
    map.getCanvas().style.cursor = "";
    map.setFilter("sitesHovered", ["==", "monitoringlocationidentifier", -1]);
  });

  // map.on("mouseout", "sitesWithData", function(e) {
  //   hoveredSite=null;
  //   map.getCanvas().style.cursor = "";
  //   map.setFilter("sitesHovered", ["==", "monitoringlocationidentifier", -1]);
  //   $("#hoverInfoBox").hide();
  // });
  //

  map.on("mouseover", 'sitesWithData', function(e) {


    hoveredSite = e.features[0]

    if(sitesVisible.indexOf(hoveredSite.properties.monitoringlocationidentifier)>-1){
      map.getCanvas().style.cursor = 'pointer';
      hoverHandler(e.features[0].properties, 'site')
      map.setFilter("sitesHovered", [
        "==",
        "monitoringlocationidentifier",
        e.features[0].properties.monitoringlocationidentifier
      ]);
    }

  });

  map.on("mouseout", 'sitesWithData', function(e) {
    map.getCanvas().style.cursor = '';
    hoveredSite = null
    $("#hoverInfoBox").hide();
    map.setFilter("sitesHovered", [
      "==",
      "monitoringlocationidentifier",
      -1
    ]);
  });
  addsitesToMap()
}

setSitesFilter=function(sites) {
  currentSites = sites;
  sites.unshift("monitoringlocationidentifier");
  sites.unshift("in");
  sitesFilter = ["all", sites];
  // map.setFilter("sitesWithData", sitesFilter);
}

unselectAllFeatures=function() {
  map
    .getSource("featureSelectedSource")
    .setData({
      type: "FeatureCollection",
      features: []
    });
  selectedHuc = null;
  buildWqQuery();
  // tableUpdate(null);
  clearSitesWithData();
  // clearDrawingEvent();
  clearSitesSelected();
}

clearSitesWithData=function() {
  // hoveredSite=null;
  // map.setFilter("sitesWithData", ["==", "monitoringlocationidentifier", -1]);
}

clearSitesSelected=function() {
  selectedSite = null;
  map.setFilter("sitesSelected", ["==", "monitoringlocationidentifier", -1]);
}

mapClams=function() {

  map.addSource('clamSource', {
    type: 'geojson',
    data: clamsData,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
  });

  // 0: '#80FFDB',
  // 1: '#72EFDD',
  // 2: '#64DFDF',
  // 3: '#48BFE3',
  // 4: '#5E60CE',
  // 5: '#6930C3',
  // 6: '#7400B8',

  map.addLayer({
    id: 'clamClusters',
    type: 'circle',
    source: 'clamSource',
    filter: ['has', 'point_count'],
    layout:{
      'visibility':'none'
    },
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#80FFDB',
        25,
        '#72EFDD',
        50,
        '#64DFDF',
        100,
        '#48BFE3',
        250,
        '#5E60CE',
        500,
        '#6930C3',
        550,
        '#7400B8'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        25,// this size when less than next number
        25,// previous size when less than this
        30,//this size wehn between previous and next
        50,//previuos size when less than this
        35,//this size wehn between previous and next
        100,//previuos size when less than this
        40,//this size wehn between previous and next
        250,//previuos size when less than this
        45,//this size wehn between previous and next
        500,//previuos size when less than this
        50//this size when greater than previous
      ]
    }
  });

  map.addLayer({
    id: 'clamCountLabel',
    type: 'symbol',
    source: 'clamSource',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 16,
      'visibility':'none'
    }
  });

  map.addLayer({
    id: 'clamPoints',
    type: 'circle',
    source: 'clamSource',
    filter: ['!', ['has', 'point_count']],
    layout:{
      'visibility':'none'
    },
    paint: {
      'circle-color': '#fff600',
      'circle-radius': 10,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000000'
    }
  });

  // inspect a cluster on click
  map.on('click', 'clamClusters', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['clamClusters']
    });
    var clusterId = features[0].properties.cluster_id;
    map.getSource('clamSource').getClusterExpansionZoom(
      clusterId,
      function(err, zoom) {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      }
    );
  });


  map.on('mouseover', 'clamPoints', function(e) {
    map.getCanvas().style.cursor = 'pointer';
    hoverHandler(e.features[0].properties, 'clams')
  });

  map.on("mouseout", 'clamPoints', function(e) {
    map.getCanvas().style.cursor = '';
    $("#hoverInfoBox").hide();
  });

  map.on('mouseenter', 'clamClusters', function() {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'clamClusters', function() {
    map.getCanvas().style.cursor = '';
  });






}

toggleClams=function(show){
  if(!show && map.getLayoutProperty('clamPoints','visibility')=='visible'){
    map.setLayoutProperty('clamClusters','visibility','none')
    map.setLayoutProperty('clamPoints','visibility','none')
    map.setLayoutProperty('clamCountLabel','visibility','none')
    map.setLayoutProperty('clamClusters','visibility','none')
  }
  if(show && map.getLayoutProperty('clamPoints','visibility')=='none'){
    map.setLayoutProperty('clamClusters','visibility','visible')
    map.setLayoutProperty('clamPoints','visibility','visible')
    map.setLayoutProperty('clamCountLabel','visibility','visible')
    map.setLayoutProperty('clamClusters','visibility','visible')
  }
}
