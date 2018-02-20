from sqlalchemy import create_engine
import pandas as pd

pathname = 'C:/github/profiles/data/public/' #DON'T FORGET CLOSING SLASH /
schema_name = 'metadata' 

#Indicator metadata
filename = 'metadata_prototype.csv'
path = pathname+filename
table_name = 'DPI_metadata'
delim = ';' 

engine = create_engine('postgresql://profiles:R3dCross+83@localhost/profiles')
df = pd.read_csv(path,delimiter=delim, encoding="windows-1251")
df.to_sql(table_name,engine,if_exists='replace',schema=schema_name)

#Country metadata
filename2 = 'country_metadata.csv'
path2 = pathname+filename2
table_name2 = 'DPI_country_metadata'
delim2 = ';' 

df = pd.read_csv(path2,delimiter=delim2, encoding="windows-1251")
df.to_sql(table_name2,engine,if_exists='replace',schema=schema_name)





