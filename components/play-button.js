const React = require('react');

class PlayButton extends React.Component {
  constructor(props) {
    super(props);
    this.date = new Date(`${props.year}-${props.month}-${props.day}`);
  }

  play() {
    this.date = new Date(
      `${this.props.year}-${this.props.month}-${this.props.day}`
    );
    // Pause if playing, play if paused
    this.props.updateProps({
      play: !this.props.play
    });

    // If turned on, auto-increment timeline
    if (this.props.play) {
      this.interval = setInterval(() => {
        this.date.setDate(this.date.getDate() + 1);

        // out of range
        if (
          this.date.getDate() >= 1 &&
          this.date.getMonth() + 1 >= 9 &&
          this.date.getFullYear() === 1973
        ) {
          this.props.updateProps({
            day: 1,
            month: 10,
            year: 1965,
            play: true
          });
          clearInterval(this.interval);
        } else {
          this.props.updateProps({
            day: this.date.getDate(),
            month: this.date.getMonth() + 1,
            year: this.date.getFullYear()
          });
        }
      }, 100);
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
