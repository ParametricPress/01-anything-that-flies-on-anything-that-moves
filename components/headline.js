// export let
// import { data } from 'path'

const React = require('react');
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
      let filteredHeadline = headlines.filter(headline => {
        return (
          headline.month === this.props.month &&
          headline.year === this.props.year
        );
      });
      let newSubset = this.state.headlineSubset.concat(filteredHeadline);
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
      return <HeadlineItem headline={headlineItem} key={index} />;
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
      <div {...props}>
        <h3>{item.headline}</h3>
        <p>{item.paragraph}</p>
      </div>
    );
  }
}

module.exports = Headline;
