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
  }

  // Looks at month to see if we need to update headlines
  componentDidUpdate(prevProps) {
    let propsDate = new Date(
      `${this.props.year}-${this.props.month}-${this.props.day}`
    );
    let prevDate = new Date(
      `${prevProps.year}-${prevProps.month}-${prevProps.day}`
    );

    if (prevDate !== propsDate) {
      // Adds headline to subset stage
      let filteredHeadline = headlines.filter(headline => {
        // prevents re-rendering infinite loop
        if (this.state.headlineSubset.includes(headline)) {
          return false;
        }
        return (
          propsDate.getMonth() + 1 === headline.startMonth &&
          propsDate.getFullYear() === headline.startYear &&
          propsDate.getDate() === headline.startDay
        );
      });

      // only update if this has an event
      if (filteredHeadline.length >= 1) {
        // Keeps only the active headlines on stage
        // let keptHeadlines = this.state.headlineSubset.filter(headline => {

        //   if (
        //     this.props.month === headline.endMonth &&
        //     this.props.year === headline.endYear &&
        //     this.props.day === headline.endDay
        //   ) {
        //     return false;
        //   } else {
        //     return true;
        //   }
        // });

        // Concats the active to the new headlines and sets it
        // as new state
        // let newSubset = keptHeadlines.concat(filteredHeadline);
        this.setState({
          headlineSubset: this.state.headlineSubset.concat(filteredHeadline)
        });
      }
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
        <button
          className={this.state.open ? 'collapsible open' : 'collapsible'}
          onClick={this.handleClick}
        >
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
