import psycopg2
import sys

conn_cred = {
    'host': "",
    'port': 25060,
    'dbname': "",
    'user': "",
    'password':""
}

postgresConnection = psycopg2.connect(**conn_cred)
postgresCursor=postgresConnection.cursor()
copy_sql = """
           COPY crbwqstaging FROM stdin WITH CSV HEADER
           DELIMITER as ','
           """
with open('../data/processedWq/wqCleaned.csv', 'r') as f:
    postgresCursor.copy_expert(sql=copy_sql, file=f)
    postgresConnection.commit()
    postgresCursor.close()



print('finished')
sys.stdout.flush()
