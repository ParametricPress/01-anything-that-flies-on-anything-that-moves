// export let
// import { data } from 'path'

const React = require('react');
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
    if (prevProps.month !== this.props.month) {
      // Adds headline to subset stage
      let filteredHeadline = headlines.filter(headline => {
        return (
          headline.month === this.props.month &&
          headline.year === this.props.year
        );
      });

      // Keeps only the active headlines on stage
      let keptHeadlines = this.state.headlineSubset.filter(headline => {
        let diffInMonth = Math.abs(this.props.month - headline.month);
        if (
          (diffInMonth === 4 && this.props.year === headline.year) ||
          (4 - this.props.month >= 0 &&
            4 - this.props.month + 12 === headline.month &&
            this.props.year === headline.year + 1)
        ) {
          headline['fade'] = true;
        }
        if (diffInMonth === 6) {
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
      console.log(this.state.headlineSubset);
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
  }
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    let item = this.props.headline;
    return (
      <div className={this.props.fade ? 'faded' : 'active'} {...props}>
        <h3>{item.headline}</h3>
        <p>{item.paragraph}</p>
      </div>
    );
  }
}

module.exports = Headline;
