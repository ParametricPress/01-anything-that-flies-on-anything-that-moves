const React = require('react');
import { Collapse } from 'react-bootstrap';
import { headlines } from './headline-data.js';

// Wrapper parent component
class Headline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headlineSubset: []
    };

    this.headline = null;

    this.stageNewHeadlines = this.stageNewHeadlines.bind(this);
    this.removeHeadlines = this.removeHeadlines.bind(this);
  }

  // When dates update, stages a new headline to display and
  // filters out any outdated events
  componentDidUpdate(prevProps) {
    let propsDate = new Date(
      `${this.props.year}-${this.props.month}-${this.props.day}`
    );
    let prevDate = new Date(
      `${prevProps.year}-${prevProps.month}-${prevProps.day}`
    );

    if (prevDate !== propsDate) {
      // Adds headline to subset stage
      this.stageNewHeadlines(propsDate);

      // Keeps only the active headlines on stage
      this.removeHeadlines(propsDate);
    }
  }

  // Takes in the current props date and filters data
  // for headlines that match current date. Returns
  // array of headline objects that do
  stageNewHeadlines(propsDate) {
    if (this.state.headlineSubset.length === 0) {
      let newHeadlines = headlines.filter(headline => {
        // prevents re-rendering infinite loop
        if (this.headline !== null) {
          return false;
        }

        let startDate = new Date(
          `${headline.startYear}-${headline.startMonth}-${headline.startDay}`
        );

        let endDate = new Date(
          `${headline.endYear}-${headline.endMonth}-${headline.endDay}`
        );

        return propsDate >= startDate && propsDate <= endDate;
      });
      if (newHeadlines.length === 1 && this.headline === null) {
        this.headline = newHeadlines[0];
        this.props.updateProps({
          speed: 350
        });
      }
    }
  }

  // Takes in a current props date and filters out
  // any headlines that have an end date that matches
  // the current. Returns an array of headline objects
  // that should remain on the stage
  removeHeadlines(propsDate) {
    if (this.headline !== null) {
      // something to remove

      let headline = this.headline;
      let startDate = new Date(
        `${headline.startYear}-${headline.startMonth}-${headline.startDay}`
      );

      let endDate = new Date(
        `${headline.endYear}-${headline.endMonth}-${headline.endDay}`
      );

      if (propsDate <= startDate || propsDate >= endDate) {
        this.headline = null;
        this.props.updateProps({
          speed: 100
        });
      }
    }
  }

  render() {
    return <HeadlineItem headline={this.headline} />;
  }
}

class HeadlineItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    let item = this.props.headline;
    return (
      <div className={this.props.fade ? 'faded' : 'active'} {...props}>
        <div className='headline-title'>
          {item === null
            ? ''
            : item.startMonth +
              '/' +
              item.startDay +
              '/' +
              item.startYear +
              ' - ' +
              item.headline}
        </div>
        <div className='headline-paragraph'>
          {item === null ? '' : item.paragraph}
        </div>
      </div>
    );
  }
}

module.exports = Headline;
