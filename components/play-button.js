const React = require('react');

class PlayButton extends React.Component {
  constructor(props) {
    super(props);
    this.play = this.play.bind(this);
    this.autoIncrement = this.autoIncrement.bind(this);

    this.date = new Date(`${props.year}/${props.month}/${props.day}`);
    console.log('date', this.date);
    this.timeout = props.timeout;
  }

  play() {
    this.date = new Date(
      `${this.props.year}/${this.props.month}/${this.props.day}`
    );
    // Pause if playing, play if paused
    this.props.updateProps({
      play: !this.props.play
    });

    this.autoIncrement(this.props.play);
  }

  autoIncrement(play) {
    // If turned on, auto-increment timeline
    if (play) {
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
          clearTimeout(this.timeout);
        } else {
          this.props.updateProps({
            day: this.date.getDate(),
            month: this.date.getMonth() + 1,
            year: this.date.getFullYear()
          });
        }
      }, 150);
    } else {
      clearInterval(this.interval);
      clearTimeout(this.timeout);
    }
  }

  // timeout up and slow down based on whether headline is triggered
  componentDidUpdate(prevProps) {
    if (prevProps.timeout !== this.props.timeout) {
      this.timeout = this.props.timeout;
      if (!this.props.play) {
        clearInterval(this.interval);
        this.timeout = setTimeout(() => {
          this.autoIncrement(true);
        }, this.timeout);
      } else {
        clearTimeout(this.timeout);
        clearInterval(this.interval);
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <div {...props}>
        <button
          onClick={this.play.bind(this)}
          className={this.props.play ? '' : 'playing'}
        >
          {this.props.play ? 'Play' : 'Pause'}
        </button>
      </div>
    );
  }
}

module.exports = PlayButton;
