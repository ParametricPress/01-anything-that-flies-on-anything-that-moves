// Reference: https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-starting-with-a-basic-graph

const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 100;

class LineChart extends D3Component {
  initialize(node, props) {
    let svg = (this.svg = d3.select(node).append('svg'));
    var margin = { top: 10, right: 0, bottom: 25, left: 0 },
      width = 1200 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

    // Parse the date
    var parseDate = d3.timeParse('%Y-%m-%d');
    var formatDate = d3.timeFormat('%b %d %Y');

    // Returns value in array data that matches horiz position of der
    var bisectDate = d3.bisector(function(d) {
      return d.DATE;
    }).left;

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define axes
    var xAxis = d3.axisBottom(x).ticks(9);

    // define line
    var valueLine = d3
      .line()
      .x(function(d) {
        return x(d.DATE);
      })
      .y(function(d) {
        return y(d.NUM_MISSIONS);
      });

    svg = svg
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '0 0 1200 150')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    var lineSvg = svg.append('g');

    var focus = svg.append('g').style('display', 'none');

    d3.csv('static/data/date_counts.csv', function(error, data) {
      data.forEach(function(d) {
        d.DATE = parseDate(d.DATE);
        d.NUM_MISSIONS = +d.NUM_MISSIONS;
      });

      // scaling data range
      x.domain(
        d3.extent(data, function(d) {
          return d.DATE;
        })
      );
      y.domain([
        0,
        d3.max(data, function(d) {
          return d.NUM_MISSIONS;
        })
      ]);

      // Add the valueline path
      lineSvg
        .append('path')
        .attr('class', 'line')
        .attr('d', valueLine(data));

      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      // append circle
      focus
        .append('circle')
        .attr('class', 'y')
        .style('fill', '#c5c5c5')
        .style('stroke', '#c5c5c5')
        .style('opacity', 0.7)
        .attr('r', 3);

      svg
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseover', function() {
          focus.style('display', null);
        })
        .on('mouseout', function() {
          focus.style('display', 'none');
        })
        .on('mousemove', mousemove);
      // .on('click', mouseclick);

      // add x dashed line
      focus
        .append('line')
        .attr('class', 'x')
        .style('stroke', '#c5c5c5')
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.5)
        .attr('y1', 0)
        .attr('y2', height);

      // place the value at the intersection
      focus
        .append('text')
        .attr('class', 'y1')
        .style('opacity', 0.8)
        .attr('dx', 3)
        .attr('dy', '-.5em');

      // place the date at the intersection
      focus
        .append('text')
        .attr('class', 'y3')
        .style('opacity', 0.8)
        .attr('dx', 3)
        .attr('dy', '-1.3em');

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.DATE > d1.DATE - x0 ? d1 : d0;

        console.log(d.DATE);
        // this.props.updateProps({
        //   day: this.date.getDate(),
        //   month: this.date.getMonth() + 1,
        //   year: this.date.getFullYear()
        // });

        focus
          .select('circle.y')
          .attr(
            'transform',
            'translate(' + x(d.DATE) + ',' + y(d.NUM_MISSIONS) + ')'
          );

        focus
          .select('.x')
          .attr(
            'transform',
            'translate(' + x(d.DATE) + ',' + y(d.NUM_MISSIONS) + ')'
          )
          .attr('y2', height - y(d.NUM_MISSIONS));

        // Return the correlated missions value
        focus
          .select('text.y1')
          .attr(
            'transform',
            'translate(' + x(d.DATE) + ',' + y(d.NUM_MISSIONS) + ')'
          )
          .text(d.NUM_MISSIONS);

        // Return correlated date value
        focus
          .select('text.y3')
          .attr(
            'transform',
            'translate(' + x(d.DATE) + ',' + y(d.NUM_MISSIONS) + ')'
          )
          .text(formatDate(d.DATE));
      }
    });
  }

  update(props, oldProps) {}
}

module.exports = LineChart;
