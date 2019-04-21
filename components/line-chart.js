// Reference: https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-starting-with-a-basic-graph

const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 100;

class LineChart extends D3Component {
  initialize(node, props) {
    const svg = (this.svg = d3.select(node).append('svg'));
    svg
      .attr('viewBox', `0 0 ${size * 2} ${size}`)
      .style('width', '100%')
      .style('height', 'auto');

    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom;

    // Parse the date
    var parseDate = d3.timeFormat('%m/%d/%Y');

    // Returns value in array data that matches horiz position of pointer
    var bisectDate = d3.bisector(function(d) {
      return d.date;
    }).left;

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define axes
    var xAxis = d3.axisBottom(x).ticks(9);

    var yAxis = d3.axisLeft(y);

    // define line
    var valueLine = d3
      .line()
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.close);
      });

    svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    var lineSvg = svg.append('g');

    var focus = svg.append('g').style('display', 'none');

    d3.csv('static/data/date_counts.csv', function(error, data) {
      data.forEach(function(point) {
        point.date = parseDate(point.DATE);
        console.log(point.date);
      });
    });
  }

  // update(props, oldProps) {
  //   this.svg
  //     .selectAll('circle')
  //     .transition()
  //     .duration(750)
  //     .attr('cx', Math.random() * size)
  //     .attr('cy', Math.random() * size);
  // }
}

module.exports = LineChart;
