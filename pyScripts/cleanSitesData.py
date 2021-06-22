import pandas as pd
import geojson
import sys

# this reads in csv from sites and results from either the url (dynamic) or via the local file
# sitesFile = pd.read_csv(sitesUrl)
sitesFile = pd.read_csv('./data/incomingWq/newSitesData.csv')

# -----------------------------------
# -----------------------------------
# -----------------------------------
#  CLEAN THE SITES A BIT
# -----------------------------------
# -----------------------------------
# -----------------------------------
sitesDataColumns=["OrganizationIdentifier","HUCEightDigitCode","OrganizationFormalName", "MonitoringLocationTypeName", "MonitoringLocationIdentifier", "MonitoringLocationName","LatitudeMeasure","LongitudeMeasure"]
sitesFile=sitesFile[sitesDataColumns]
siteTypeFilter=["Stream","River/Stream","Lake, Reservoir, Impoundment","Lake","Reservoir","River/Stream","River/stream Effluent-Dominated","River/Stream Ephemeral","River/Stream Perennial""Stream","Stream: Canal","Stream: Ditch","Stream: Tidal stream"]
sitesFile[sitesFile.MonitoringLocationTypeName.isin(siteTypeFilter)]
# this subsets the results data by just selecting the above columns
sitesFile=sitesFile[sitesFile.MonitoringLocationTypeName.isin(siteTypeFilter)]

# for now, let's drop any sites that don't have observations
# uniqueResultSites=resultsFile.MonitoringLocationIdentifier.unique()
# sitesFile=sitesFile[sitesFile.MonitoringLocationIdentifier.isin(uniqueResultSites)]

# force column names lowercase for postgres
sitesFile.columns = map(str.lower, sitesFile.columns)

sitesFile["istheredata"]='FALSE';

sitesFile["huceightdigitcode"] = sitesFile["huceightdigitcode"].astype(int)

sitesFile.to_csv('./data/processedWq/sitesCleaned.csv', sep=',', index=False)




print('finished')
sys.stdout.flush()
