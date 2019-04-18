const React = require('react');

class Date extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      months: [
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
      ]
    };
  }
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <div {...props}>
        {this.state.months[parseInt(this.props.month - 1)] +
          ' ' +
          parseInt(this.props.year)}
      </div>
    );
  }
}

module.exports = Date;
