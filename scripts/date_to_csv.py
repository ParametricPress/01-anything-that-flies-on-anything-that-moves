# Separates large data to separate csvs by month and year 
# in format [TGTLATDD_DDD_WGS84,TGTLONDDD_DDD_WGS84]

import pandas as pd

data = pd.read_csv('missions.csv', index_col=0)


for i in range(1963, 1974):
	subset = data[data.YEAR == i]
	for j in range(1, 13):
        	month = subset[subset.MONTH == j]
        	if not month.empty: # make sure month exists
                	print(str(i) + "," + str(j))
			month_year_data = month[['TGTLATDD_DDD_WGS84', 'TGTLONDDD_DDD_WGS84']]
			data.drop(data.columns[0], axis=1)
			month_year_data.to_csv(str(j) + "_" + str(i) + ".csv", index=False)
			

