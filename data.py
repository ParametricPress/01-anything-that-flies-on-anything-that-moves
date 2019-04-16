# Clean the big dataset and get rid of null lat/long rows

import pandas as pd

data = pd.read_csv('../thor_data_vietnam.csv')

data = data.dropna(subset=['TGTLATDD_DDD_WGS84'])

# Add month and year data for filtering
data['MSNDATE'] = pd.to_datetime(data['MSNDATE'].astype(str), errors='coerce')

data['YEAR'], data['MONTH'] = data['MSNDATE'].dt.year, data['MSNDATE'].dt.month

# Filter for only kinetic flights under US
data = data[data.MFUNC_DESC_CLASS == 'KINETIC']
data = data[data.COUNTRYFLYINGMISSION == 'UNITED STATES OF AMERICA']

# Filter out air patrol missions
data = data[~data.MFUNC_DESC.str.contains('PATROL')]

# Drop unnecessary columns
data = data[data.columns.drop(list(data.filter(regex='Unnamed')))]
columns = ['AIRFORCEGROUP', 'AIRFORCESQDN', 'MFUNC', 'TGTCLOUDCOVER', 'TGTCONTROL', 'TGTID', 'TGTWEATHER', 'RELEASEALTITUDE', 'RELEASEFLTSPEED', 'MILSERVICE', 'VALID_AIRCRAFT_ROOT', 'TGTTYPE', 'NUMWEAPONSDELIVERED', 'TIMEONTARGET', 'WEAPONTYPE', 'WEAPONTYPECLASS', 'WEAPONTYPEWEIGHT', 'AIRCRAFT_ORIGINAL', 'AIRCRAFT_ROOT', 'CALLSIGN', 'FLTHOURS', 'NUMOFACFT', 'PERIODOFDAY', 'UNIT', 'ADDITIONALINFO', 'GEOZONE', 'NUMWEAPONSJETTISONED','NUMWEAPONSRETURNED','RESULTSBDA','TIMEOFFTARGET','WEAPONSLOADEDWEIGHT']

data.drop(columns, axis=1, inplace=True)

data.to_csv('test_data1.csv')
