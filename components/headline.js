const React = require('react');
import { Collapse } from 'react-bootstrap';
import { headlines } from '../headline-data.js';

// Wrapper parent component
class Headline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headlineSubset: []
    };
  }

  // Looks at month to see if we need to update headlines
  componentDidUpdate(prevProps) {
    if (prevProps.month !== this.props.month) {
      // Adds headline to subset stage
      let filteredHeadline = headlines.filter(headline => {
        return (
          headline.startMonth === this.props.month &&
          headline.startYear === this.props.year
        );
      });

      // Keeps only the active headlines on stage
      let keptHeadlines = this.state.headlineSubset.filter(headline => {
        // let diffInMonth = Math.abs(this.props.month - headline.startMonth);

        // if the date is the same: remove
        // if the date is 1 month before, fade
        if (
          (this.props.month === headline.endMonth - 1 &&
            this.props.year === headline.endYear) ||
          (this.props.month === 12 &&
            headline.endMonth === 1 &&
            this.props.year === headline.endYear - 1)
        ) {
          headline['fade'] = true;
        }
        if (
          this.props.month === headline.endMonth &&
          this.props.year === headline.endYear
        ) {
          return false;
        } else {
          return true;
        }
      });

      // Concats the active to the new headlines and sets it
      // as new state
      let newSubset = keptHeadlines.concat(filteredHeadline);
      this.setState({
        headlineSubset: newSubset
      });
    }
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
        <button className='collapsible' onClick={this.handleClick}>
          <h3>{item.headline}</h3>
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
