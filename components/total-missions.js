const React = require('react');
const Papa = require('papaparse');

class TotalMissions extends React.Component {
  constructor(props) {
    super(props);
    this.map = new Map();

    Papa.parse(`static/data/by-year/${year}.csv`, {
      // worker: true,
      delimiter: ',',
      download: true,
      fastMode: true,
      step: results => {
        results.data.forEach(d => {
          let [dataYear, month, day] = d[0].split('-');
          dataYear = +dataYear;
          month = +month;
          day = +day;

          map.set([day, month, dataYear], 0);
        });
      }
    });
  }

  render() {
    const { day, month, year } = this.props;
    return <div>hi</div>;
  }
}

module.exports = TotalMissions;
