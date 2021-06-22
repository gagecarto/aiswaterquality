import pandas as pd
import sys
from datetime import datetime

# resultsFile = pd.read_csv(resultsUrl)
# resultsFile = pd.read_csv('./sampleData/170401_since_01012009.csv')

resultsFile = pd.read_csv('./data/incomingWq/newWqData.csv')

# year='2009'
# resultsFile = pd.read_csv(year+'.csv')

# resultsFile = pd.read_csv('1950-1975.csv')
# cleanedFileName = '2018-20200411_clean.csv'

# print('--- TOTAL ROWS ---')
# print(resultsFile.shape[0])
# sys.stdout.flush()


if resultsFile.shape[0]==0:
    print('noData')
    sys.stdout.flush()
    sys.exit(0)



print('yes new data!')
sys.stdout.flush()

# -----------------------------------
# -----------------------------------
# -----------------------------------
#  CLEANING IMPORTED DATA
# -----------------------------------
# -----------------------------------
# -----------------------------------
# these are teh columns we'd like to subset from the results data
resultsDataColumns=["OrganizationFormalName","ActivityStartDate", "ActivityStartTime/Time",
                "ActivityStartTime/TimeZoneCode","CharacteristicName",
                "MonitoringLocationIdentifier","SampleCollectionMethod/MethodName",
                "SampleCollectionEquipmentName","ResultMeasureValue", "ResultMeasure/MeasureUnitCode",
                "ResultSampleFractionText","ResultAnalyticalMethod/MethodName", "MethodDescriptionText","ProviderName"]
# this subsets the results data by just selecting the above columns
resultsFile=resultsFile[resultsDataColumns]
# print(resultsFile.info())
# -----------------------------------
# DROP NA ROWS
# -----------------------------------
# drop those rows that have na values in ResultMeasureValue
# print(len(resultsFile))
resultsFile=resultsFile.dropna(subset=['ResultMeasureValue'])
resultsFile.ResultMeasureValue = pd.to_numeric(resultsFile.ResultMeasureValue, errors='coerce')
# print(len(resultsFile))
# -----------------------------------
# -----------------------------------
# REMOVE WHITE space
# -----------------------------------
# -----------------------------------
lastRow=len(resultsFile)
# this looks like white space was already stripped on import
# print(resultsFile.iloc[lastRow-10:lastRow,9])
# let's force some white space on that obs and then change it
# resultsFile.iloc[lastRow-1:lastRow,9]='               dec C                 '
whiteSpaceExample=resultsFile.iloc[lastRow-1:lastRow,9]
# print(whiteSpaceExample)
# print(whiteSpaceExample.str.strip())
# or on the whole column
# print(resultsFile.iloc[lastRow-10:lastRow,9].str.strip())
# or modify the whole column and remove white space permanently
resultsFile.iloc[0:lastRow,9]=resultsFile.iloc[0:lastRow,9].str.strip()
# print(resultsFile.iloc[0:lastRow,9])
# -----------------------------------
# -----------------------------------
# CALCIUM specific cleaning
# -----------------------------------
# -----------------------------------
sampleFractionFilter=['Dissolved','Total']
# this is just for testing
# subset of calcium rows
calciumRows=resultsFile.loc[resultsFile['CharacteristicName'] == 'Calcium']
# 1527 rows have calcium
len(calciumRows)
# this removes those rows that don't have a ResultSampleFractionText value in sampleFractionFilter
calciumRowsFiltered=calciumRows[calciumRows.ResultSampleFractionText.isin(sampleFractionFilter)]
# 1504 rows
len(calciumRowsFiltered)
# now apply to entire dataframe
# these are the ~23 rows to drop
resultsFile.loc[(resultsFile['CharacteristicName'] == 'Calcium') & (~resultsFile.ResultSampleFractionText.isin(sampleFractionFilter))]
# or the n-23 calcium rows not to drop... note the ~
resultsFile.loc[(resultsFile['CharacteristicName'] == 'Calcium') & (resultsFile.ResultSampleFractionText.isin(sampleFractionFilter))]
# drop them from the entire DF with drop and not index
resultsFile=resultsFile.drop(resultsFile[(resultsFile['CharacteristicName'] == 'Calcium') & (~resultsFile.ResultSampleFractionText.isin(sampleFractionFilter))].index)
# now we only want those calcium values that were measured in either micrograms per liter (ug/l) and milligrams per liter (mg/l)
# i added three rows to the dirty file with values of foo in the measurement units
# also added 3 rows where I converted mg/l to ug/l since there were no instances of ug/l in this query result
#
# first let's only grab those rows with mg and ug values.. this will drop the 3x foo values
measureUnitCodeFilter=['ug/l','mg/l']
# again... these are the 3 rows with foo to remove
resultsFile.loc[(resultsFile['CharacteristicName'] == 'Calcium') & (~resultsFile["ResultMeasure/MeasureUnitCode"].isin(measureUnitCodeFilter))]
# drop them from the data frame
resultsFile=resultsFile.drop(resultsFile[(resultsFile['CharacteristicName'] == 'Calcium') & (~resultsFile["ResultMeasure/MeasureUnitCode"].isin(measureUnitCodeFilter))].index)
# ---
# convert ug/l values to mg/l
# which rows are ug/l
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'ug/l',['ResultMeasure/MeasureUnitCode','ResultMeasureValue']]
# just the measurement values
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'ug/l','ResultMeasureValue']
# divided by 1000
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'ug/l','ResultMeasureValue']/1000
# convert those in the dataframe
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'ug/l','ResultMeasureValue']=resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'ug/l','ResultMeasureValue']/1000
# and change the units
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'ug/l','ResultMeasure/MeasureUnitCode']
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'ug/l','ResultMeasure/MeasureUnitCode']='mg/l'


resultsFile=resultsFile.drop(resultsFile[(resultsFile['CharacteristicName'] == 'Calcium') & (resultsFile.ResultMeasureValue>200) | (resultsFile.ResultMeasureValue<1)].index)

# -----------------------------------
# -----------------------------------
# TEMPERATURE SPECIFIC CLEANING
# really just converting those values in F to C
# -----------------------------------
# -----------------------------------
# which rows are in F
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'deg F']
# and their values
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'deg F','ResultMeasureValue']
# convert those to c
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'deg F','ResultMeasureValue']=(resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'deg F','ResultMeasureValue']-32)/1.8
# and change the units
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'deg F','ResultMeasure/MeasureUnitCode']='deg C'
#also make sure all those rows have a Characteristic Name of tmperature units are labeled as temp
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'deg C','CharacteristicName']='temperature'

# -----------------------------------
# -----------------------------------
# PH SPECIFIC CLEANING ------
# -----------------------------------
# -----------------------------------
phRows=resultsFile.loc[resultsFile['CharacteristicName'] == 'pH']
# dealing with mV values
# convert those mV values to unitless via (7*(1-ResultMeasureValue/400))
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'mV','ResultMeasureValue']=7*(1-resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'mV','ResultMeasureValue']/400)
resultsFile.loc[resultsFile['ResultMeasure/MeasureUnitCode'] == 'mV','ResultMeasure/MeasureUnitCode']='None'


# remove any rows with values outside 4-11
resultsFile.loc[(resultsFile['CharacteristicName'] == 'pH') & (resultsFile.ResultMeasureValue>10.9999999) | (resultsFile.ResultMeasureValue<3.9999999999),'ResultMeasureValue']
# drop them from the df
resultsFile=resultsFile.drop(resultsFile[(resultsFile['CharacteristicName'] == 'pH') & (resultsFile.ResultMeasureValue>11) | (resultsFile.ResultMeasureValue<4)].index)
# -----------------------------------
# -----------------------------------
# ORGANIZE BY ROW WHERE EACH ROW IS A UNIQUE DATE AT A UNIQUE MonitoringLocationIdentifier
# -----------------------------------
# -----------------------------------
# create a temporary vector of site id and date.. this will be used to assess unique place times
resultsFile["siteTimes"]=resultsFile.ActivityStartDate+'_break_'+resultsFile.MonitoringLocationIdentifier
uniqueSiteDates=resultsFile.siteTimes.unique()
#
newColumns=['monitoringlocationidentifier','date','phMean','phMax','phMin','phSd','phCnt','caMean','caMax','caMin','caSd','caCnt','tempMean','tempMax','tempMin','tempSd','tempCnt','uniqueSiteDates']
# create the empty df
newDf=pd.DataFrame(columns=newColumns)
newDf.uniqueSiteDates=uniqueSiteDates
# newDf.info()

theseDates=newDf['uniqueSiteDates'].str.split('_break_',expand=True)[0]
theseSites=newDf['uniqueSiteDates'].str.split('_break_',expand=True)[1]

newDf["date"]=theseDates
newDf["monitoringlocationidentifier"]=theseSites
usdlen=len(uniqueSiteDates)

# iterative over unique days at each unique site
resultsFile.set_index('siteTimes')
newDf.set_index('uniqueSiteDates')


startTime = datetime.now()
startTime = startTime.strftime("%H:%M:%S")
#
# newDft=newDf.head(1000)

for idx in newDf.itertuples():
    # these are the rows for this site on this day
    siteDate=idx.uniqueSiteDates
    theseSiteDateRows=resultsFile.loc[resultsFile.siteTimes==siteDate]
    # and the total obersvations
    thisSiteDateStats=theseSiteDateRows[["ResultMeasureValue","CharacteristicName"]].groupby("CharacteristicName").describe()
    thisSiteDateStats=thisSiteDateStats.ResultMeasureValue
    thisSiteDateStats['CharacteristicName']=thisSiteDateStats.index
    thisTempRow=newDf.loc[newDf.uniqueSiteDates==siteDate]
    if thisSiteDateStats.CharacteristicName.str.contains('pH').sum()>0:
        thisSubDat=thisSiteDateStats.loc[thisSiteDateStats.CharacteristicName=='pH']
        thisTempRow.phMean=float(thisSubDat['mean'])
        thisTempRow.phMax=float(thisSubDat['max'])
        thisTempRow.phMin=float(thisSubDat['min'])
        thisTempRow.phSd=float(thisSubDat['std'])
        thisTempRow.phCnt=float(thisSubDat['count'])
    if thisSiteDateStats.CharacteristicName.str.contains('Calcium').sum()>0:
        thisSubDat=thisSiteDateStats.loc[thisSiteDateStats.CharacteristicName=='Calcium']
        thisTempRow.caMean=float(thisSubDat['mean'])
        thisTempRow.caMax=float(thisSubDat['max'])
        thisTempRow.caMin=float(thisSubDat['min'])
        thisTempRow.caSd=float(thisSubDat['std'])
        thisTempRow.caCnt=float(thisSubDat['count'])
    if thisSiteDateStats.CharacteristicName.str.contains('temperature').sum()>0:
        thisSubDat=thisSiteDateStats.loc[thisSiteDateStats.CharacteristicName=='temperature']
        thisTempRow.tempMean=float(thisSubDat['mean'])
        thisTempRow.tempMax=float(thisSubDat['max'])
        thisTempRow.tempMin=float(thisSubDat['min'])
        thisTempRow.tempSd=float(thisSubDat['std'])
        thisTempRow.tempCnt=float(thisSubDat['count'])
    newDf.loc[newDf.uniqueSiteDates==siteDate]=thisTempRow

endTime = datetime.now()
endTime = endTime.strftime("%H:%M:%S")


# drop the unique site date column afterwards
newDf.drop(['uniqueSiteDates'],axis=1, inplace=True)

newDf["sitedate"]=newDf.monitoringlocationidentifier+newDf.date
# force column names lowercase for postgres
newDf.columns = map(str.lower, newDf.columns)

# write it all to a new CSV

newDf.to_csv('./data/processedWq/wqCleaned.csv', sep=',', encoding='utf-8', index=False)
# newDf.to_csv('1950-1975cleaned.csv', sep=',', encoding='utf-8', index=False)


sys.stdout.flush()

print('finished')
sys.stdout.flush()
