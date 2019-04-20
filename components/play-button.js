const React = require('react');

class PlayButton extends React.Component {
  constructor(props) {
    super(props);
    this.date = new Date(`${props.year}-${props.month}-${props.day}`);
  }
  play() {
    // Pause if playing, play if paused
    this.props.updateProps({
      play: !this.props.play
    });

    // If turned on, auto-increment timeline
    if (this.props.play) {
      this.interval = setInterval(() => {
        this.date.setDate(this.date.getDate() + 1);
        // TODO - check if we've gone out of range
        console.log(this.date);
        console.log(this.date.getDate(), this.date.getMonth() + 1, this.date.getFullYear())

        this.props.updateProps({
          day: this.date.getDate(),
          month: this.date.getMonth() + 1,
          year: this.date.getFullYear(),
        })
      }, 250);
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
