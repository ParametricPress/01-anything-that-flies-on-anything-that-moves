const csv = require('csv-parser')
const fs = require('fs')

const roundToDecimalPlaces = (x, n) => {
  return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}


const results1 = [];
const results2 = [];

// const cutoffDate = new Date('1969-01-01');
const cutoffDate = new Date('1966-01-01');
const headers = ['date', 'lat', 'lng'];

fs.createReadStream(__dirname + '/../missions.csv')
  .pipe(csv())
  .on('data', (d) => {
    // console.log(d);
    const date = new Date(d.MSNDATE);

    if (date < cutoffDate) {
      results1.push({
        date: d.MSNDATE,
        lat: roundToDecimalPlaces(d.TGTLATDD_DDD_WGS84, 4),
        lng:roundToDecimalPlaces(d.TGTLONDDD_DDD_WGS84, 4)
      })
    } else {

      results2.push({
        date: d.MSNDATE,
        lat: roundToDecimalPlaces(d.TGTLATDD_DDD_WGS84, 4),
        lng:roundToDecimalPlaces(d.TGTLONDDD_DDD_WGS84, 4)
      })
    }
  })
  .on('end', () => {
    const headers = Object.keys(results1[0]);

    fs.writeFileSync('static/data/results1.csv', results1.map(d => {
      return [d.date, d.lat, d.lng].join(',');
    }).join('\n'))
    // fs.writeFileSync('results2.csv', [headers.join(',')].concat(results2.map(d => {
    //   return [d.date, d.lat, d.lng].join(',');
    // })).join('\n'))
  });