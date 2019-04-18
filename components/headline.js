// export let
// import { data } from 'path'

const React = require('react');
import { headlines } from '../headline-data.js';

class Headline extends React.Component {
  // Wrapper parent component
  render() {
    return <HeadlineList headlineList={headlines} />;
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
        <h1>{item.headline}</h1>
        <p>{item.paragraph}</p>
      </div>
    );
  }
}

module.exports = Headline;
