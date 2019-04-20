const React = require('react');

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

class Date extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { day, month, year } = this.props;
    return (
      <div>
        {`${months[parseInt(month - 1)]} ${day} ${year}`}
      </div>
    );
  }
}

module.exports = Date;
