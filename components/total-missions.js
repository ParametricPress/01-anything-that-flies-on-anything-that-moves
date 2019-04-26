const React = require('react');

class TotalMissions extends React.Component {
  constructor(props) {
    super(props);
    this.map = new Map();

    props.data.forEach(obj => {
      this.map.set(obj.DATE, obj.TOTAL_MISSIONS);
    });
  }

  render() {
    const { day, month, year } = this.props;
    var strDate = month + '/' + day + '/' + String(year).substring(2);
    var numMissions = this.map.get(strDate);
    var formatNum = String(numMissions).replace(/(.)(?=(\d{3})+$)/g, '$1,');
    return <div>{formatNum + ' Completed Bombing Missions'}</div>;
  }
}

module.exports = TotalMissions;
