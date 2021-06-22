import os
import glob
import pandas as pd


extension = 'csv'
all_filenames = [i for i in glob.glob('*.{}'.format(extension))]

resultsDataColumns=["OrganizationFormalName","ActivityStartDate", "ActivityStartTime/Time",
                "ActivityStartTime/TimeZoneCode","CharacteristicName",
                "MonitoringLocationIdentifier","SampleCollectionMethod/MethodName",
                "SampleCollectionEquipmentName","ResultMeasureValue", "ResultMeasure/MeasureUnitCode",
                "ResultSampleFractionText","ResultAnalyticalMethod/MethodName", "MethodDescriptionText","ProviderName"]


fn = r'c:/tmp/test.h5'
store = pd.HDFStore(fn)

df = pd.DataFrame()
for f in all_filenames:
    x = pd.read_csv(f)
    # process `x` DF here
    store.append('df_key', df, data_columns=resultsDataColumns, complib='blosc', complevel=5)

store.close()
