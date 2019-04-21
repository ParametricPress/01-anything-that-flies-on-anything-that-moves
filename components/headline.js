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
      let filteredHeadline = this.stageNewHeadlines(propsDate);

      // Keeps only the active headlines on stage
      let keptHeadlines = this.removeHeadlines(propsDate);

      // Concats the active to the new headlines and sets it
      // as new state
      let newSubset = keptHeadlines.concat(filteredHeadline);

      // Only update if you either need to add or remove headline
      if (
        filteredHeadline.length >= 1 ||
        keptHeadlines.length !== this.state.headlineSubset.length
      ) {
        this.setState({
          headlineSubset: newSubset
        });
      }
    }
  }

  // Takes in the current props date and filters data
  // for headlines that match current date. Returns
  // array of headline objects that do
  stageNewHeadlines(propsDate) {
    let newHeadlines = headlines.filter(headline => {
      // prevents re-rendering infinite loop
      if (this.state.headlineSubset.includes(headline)) {
        return false;
      }
      return (
        propsDate.getMonth() + 1 === headline.startMonth &&
        propsDate.getFullYear() === headline.startYear &&
        (propsDate.getDate() === headline.startDay ||
          (headline.startDay === 31 &&
            propsDate.getDate() + 1 === headline.startDay))
      );
    });
    return newHeadlines;
  }

  // Takes in a current props date and filters out
  // any headlines that have an end date that matches
  // the current. Returns an array of headline objects
  // that should remain on the stage
  removeHeadlines(propsDate) {
    let currentHeadlines = this.state.headlineSubset.filter(headline => {
      let headlineEndDate = new Date(
        `${headline.endYear}-${headline.endMonth}-${headline.endDay}`
      );

      // If the curr date is one week before end day, fade out
      headlineEndDate.setDate(headlineEndDate.getDate() - 7);
      if (
        propsDate.getDate() === headlineEndDate.getDate() &&
        propsDate.getMonth() === headlineEndDate.getMonth() &&
        propsDate.getFullYear() === headlineEndDate.getFullYear()
      ) {
        headline['fade'] = true;
      }

      // don't include in the kept headlines if end dates are met
      if (
        propsDate.getMonth() + 1 === headline.endMonth &&
        propsDate.getFullYear() === headline.endYear &&
        propsDate.getDate() + 1 === headline.endDay
      ) {
        return false;
      } else {
        return true;
      }
    });

    return currentHeadlines;
  }

  render() {
    return <HeadlineList headlineList={this.state.headlineSubset} />;
  }
}

class HeadlineList extends React.Component {
  // List component
  render() {
    const { headlineList } = this.props;
    let allHeadlines = headlineList.map((headlineItem, index) => {
      return (
        <HeadlineItem
          fade={headlineItem.fade}
          headline={headlineItem}
          key={index}
        />
      );
    });
    return <div>{allHeadlines}</div>;
  }
}

class HeadlineItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  handleClick = () => {
    this.setState({
      open: !this.state.open
    });
  };

  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    let item = this.props.headline;
    return (
      <div className={this.props.fade ? 'faded' : 'active'} {...props}>
        <button
          className={this.state.open ? 'collapsible open' : 'collapsible'}
          onClick={this.handleClick}
        >
          <p className='headline'>
            {item.startMonth +
              '/' +
              item.startDay +
              '/' +
              item.startYear +
              ' - ' +
              item.headline}
          </p>
        </button>
        <Collapse in={this.state.open}>
          <div>
            <p>{item.paragraph}</p>
          </div>
        </Collapse>
      </div>
    );
  }
}

module.exports = Headline;
