const React = require('react');

class PlayButton extends React.Component {
  play() {
    // Pause if playing, play if paused
    this.props.updateProps({
      play: !this.props.play
    });

    // If turned on, auto-increment timeline
    if (this.props.play) {
      this.interval = setInterval(() => {
        if (this.props.month === 12) {
          // Wrap around if month is Dec and increment year
          var newYear = 1965 + ((this.props.year + 1 - 1965) % 9);
          this.props.updateProps({
            month: 1,
            year: newYear
          });
        } else {
          this.props.updateProps({
            month: this.props.month + 1 // regularly update month
          });
        }
      }, 500);
    } else {
      clearInterval(this.interval);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <div {...props}>
        <button onClick={this.play.bind(this)}>
          {this.props.play ? 'Play' : 'Pause'}
        </button>
      </div>
    );
  }
}

module.exports = PlayButton;
