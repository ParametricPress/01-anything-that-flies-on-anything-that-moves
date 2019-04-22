const csv = require('csv-parser')
const fs = require('fs')

const roundToDecimalPlaces = (x, n) => {
  return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}

const minYear = 1965;
const maxYear = 1975;

const results = {};

for (var i = minYear; i <= maxYear; i++) {
  results[i] = [];
}

fs.createReadStream(__dirname + '/../missions.csv')
  .pipe(csv())
  .on('data', (d) => {
    if (d.MSNDATE.trim() === '') {
      return;
    }
    const date = new Date(d.MSNDATE);
    const year = date.getFullYear();

    try {
      results[+year].push({
        date: d.MSNDATE,
        lat: roundToDecimalPlaces(d.TGTLATDD_DDD_WGS84, 4),
        lng:roundToDecimalPlaces(d.TGTLONDDD_DDD_WGS84, 4)
      })
    } catch(e) {
      console.log(year);
      console.log(d.MSNDATE);
      console.log(date.getFullYear());
    }
  })
  .on('end', () => {
    Object.keys(results).forEach((year) => {
      fs.writeFileSync(`static/data/by-year/${year}.csv`, results[year].map(d => {
        return [d.date, d.lat, d.lng].join(',');
      }).join('\n'))
    })
  });