selectedHuc = null;
hoveredSite = null;
selectedSite = null;
justBor = false;
justPh = false;
mapReady = false;

fourPlusLineWidth = [
  "interpolate",
  ["linear"],
  ["get", "StreamOrde"],
  4,
  0.75,
  9,
  2
];

fourPlusLineWidthData = [
  "interpolate",
  ["linear"],
  ["get", "StreamOrde"],
  4,
  6,
  9,
  10
];

threeMinusLideWidth = [
  "interpolate",
  ["linear"],
  ["get", "StreamOrde"],
  2,
  0.55,
  3,
  0.75
]

threeMinusLideWidthData = [
  "interpolate",
  ["linear"],
  ["get", "StreamOrde"],
  2,
  2,
  3,
  4
]


// gradientColors={
//   0:'#f2f0f7',
//   1:'#dadaeb',
//   2:'#bcbddc',
//   3:'#9e9ac8',
//   4:'#807dba',
//   5:'#6a51a3',
//   6:'#4a1486',
// }

gradientColors = {
  0: '#80FFDB',
  1: '#72EFDD',
  2: '#64DFDF',
  3: '#48BFE3',
  4: '#5E60CE',
  5: '#6930C3',
  6: '#7400B8',
}

sourceLayersConfig = {
  flowlines3Minus: {
    sourceUrl: "mapbox://adamsepulveda.bz2c624q",
    sourceLayer: "crbgyeflowlines_3minus"
  },
  flowlines4Plus: {
    sourceUrl: "mapbox://adamsepulveda.d7wixcth",
    sourceLayer: "crbgyeflowlines_4plus"
  }
}

defaultRadius = {
  base: 3,
  stops: [
    [12, 10],
    [22, 150]
  ]
}
// defaultRadius = 10;


riskDrawCaseSitesRadius = [
  "case",
  ["==", ["feature-state", "drawColor"], 0],
  7,
  ["==", ["feature-state", "drawColor"], 0.01],
  9,
  ["==", ["feature-state", "drawColor"], 0.1],
  11,
  ["==", ["feature-state", "drawColor"], 1],
  12,
  4
]

riskDrawCaseSitesStroke=[
  "case",
  ["==", ["feature-state", "drawColor"], 0],
  'rgba(0, 0, 0, 0.85)',
  ["==", ["feature-state", "drawColor"], 0.01],
  'rgba(0, 0, 0, 0.85)',
  ["==", ["feature-state", "drawColor"], 0.1],
  'rgba(0, 0, 0, 0.85)',
  ["==", ["feature-state", "drawColor"], 1],
  'rgba(0, 0, 0, 0.85)',
  'rgba(0, 0, 0, 0)',
]


riskDrawCaseSitesColor = [
  "case",
  ["==", ["feature-state", "drawColor"], 0], gradientColors[0],
  ["==", ["feature-state", "drawColor"], 0.01], gradientColors[0],
  ["==", ["feature-state", "drawColor"], 0.1], gradientColors[3],
  ["==", ["feature-state", "drawColor"], 1], gradientColors[6],
  // ["==", ["feature-state", "drawColor"], 0], gradientColors[0],
  // ["==", ["feature-state", "drawColor"], 1], gradientColors[1],
  // ["==", ["feature-state", "drawColor"], 2], gradientColors[2],
  // ["==", ["feature-state", "drawColor"], 3], gradientColors[3],
  // ["==", ["feature-state", "drawColor"], 4], gradientColors[4],
  // ["==", ["feature-state", "drawColor"], 5], gradientColors[5],
  // ["==", ["feature-state", "drawColor"], 6], gradientColors[6],
  'rgba(122, 122, 122, 0.7)'
]

// riskDrawCaseSitesColor = 'rgb(255, 251, 0)'


riskDrawCaseSitesOpacitySmallZoom = [
  "case",
  // ["==", ["feature-state", "drawColor"], 0], 0,
  ["==", ["feature-state", "drawColor"], 0], 0,
  ["==", ["feature-state", "drawColor"], 0.01], 1,
  ["==", ["feature-state", "drawColor"], 0.1], 1,
  ["==", ["feature-state", "drawColor"], 1], 1,
  0
]

riskDrawCaseSitesOpacityMediumZoom = [
  "case",
  // ["==", ["feature-state", "drawColor"], 0], 0,
  ["==", ["feature-state", "drawColor"], 0], 0,
  ["==", ["feature-state", "drawColor"], 0.01], 1,
  ["==", ["feature-state", "drawColor"], 0.1], 1,
  ["==", ["feature-state", "drawColor"], 1], 1,
  0.5
]


riskDrawCaseSitesOpacityBigZoom = [
  "case",
  ["==", ["feature-state", "drawColor"], 0], 0,
  ["==", ["feature-state", "drawColor"], 0.01], 1,
  ["==", ["feature-state", "drawColor"], 0.1], 1,
  ["==", ["feature-state", "drawColor"], 1], 1,
  1
]


riskDrawCaseNhd = [
  "case",
  ["==", ["feature-state", "drawColor"], 0], gradientColors[0],
  ["==", ["feature-state", "drawColor"], 0.1], gradientColors[3],
  ["==", ["feature-state", "drawColor"], 1], gradientColors[6],
  // ["==", ["feature-state", "drawColor"], 0], gradientColors[0],
  // ["==", ["feature-state", "drawColor"], 1], gradientColors[1],
  // ["==", ["feature-state", "drawColor"], 2], gradientColors[2],
  // ["==", ["feature-state", "drawColor"], 3], gradientColors[3],
  // ["==", ["feature-state", "drawColor"], 4], gradientColors[4],
  // ["==", ["feature-state", "drawColor"], 5], gradientColors[5],
  // ["==", ["feature-state", "drawColor"], 6], gradientColors[6],
  'rgba(29, 129, 191,0)'
]

riskDrawCaseNhdSmallZoom = [
  "case",
  ["==", ["feature-state", "drawColor"], 0], 0,
  ["==", ["feature-state", "drawColor"], 0.1], 0.75,
  ["==", ["feature-state", "drawColor"], 1], 1,
  // ["==", ["feature-state", "drawColor"], 0], 0,
  // ["==", ["feature-state", "drawColor"], 1], 0.75,
  // ["==", ["feature-state", "drawColor"], 2], 0.75,
  // ["==", ["feature-state", "drawColor"], 3], 0.75,
  // ["==", ["feature-state", "drawColor"], 4], 1,
  // ["==", ["feature-state", "drawColor"], 5], 1,
  // ["==", ["feature-state", "drawColor"], 6], 1,
  0
]

riskDrawCaseNhdBigZoom = [
  "case",
  ["==", ["feature-state", "drawColor"], 0], 1,
  ["==", ["feature-state", "drawColor"], 1], 1,
  ["==", ["feature-state", "drawColor"], 2], 1,
  ["==", ["feature-state", "drawColor"], 3], 1,
  ["==", ["feature-state", "drawColor"], 4], 1,
  ["==", ["feature-state", "drawColor"], 5], 1,
  ["==", ["feature-state", "drawColor"], 6], 1,
  1
]

zoomStatus = 'small';

metadataObject = {};


resultsType = 'sites'
// selectedMetric = 'caph'
selectedMetric = 'ca'

tempThreshold = 'none'
minPhSampleSize = 0;
minCaSampleSize = 0;

thresholdsObject = {
  ph: {
    'low': 0,
    'medium1Low': 7,
    'medium1High': 7.3,
    'medium2Low': 9.4,
    'medium2High': 9.6,
    'highLow': 7.3,
    'highHigh': 9.4
  },
  ca: {
    'low': 0,
    'medium': 8,
    'high': 20
  },
  temp: {
    'low': 0,
    'medium': 14,
    'high': 28
  }
}



// serverRoot = 'http://159.89.88.231:3000/'
// serverRoot='http://localhost:3000/'
serverRoot = 'https://aiswaterquality.net/'

avgTable = null;

selectMode = 'all'
