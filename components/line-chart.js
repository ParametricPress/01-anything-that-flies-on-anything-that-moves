// Reference: https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-starting-with-a-basic-graph

const D3Component = require('idyll-d3-component');
const d3 = require('d3');
import { headlines } from './headline-data.js';

const size = 100;

class LineChart extends D3Component {
  initialize(node, props) {
    this.play = props.play;

    let svg = (this.svg = d3.select(node).append('svg'));
    var margin = { top: 10, right: 0, bottom: 25, left: 0 },
      width = 1200 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

    // Parse the date
    var parseDate = d3.timeParse('%Y-%m-%d');
    var formatDate = d3.timeFormat('%b %d %Y');

    // Returns value in array data that matches horiz position of der
    var bisectDate = d3.bisector(function(d) {
      return d.formattedDate;
    }).left;

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define axes
    var xAxis = d3.axisBottom(x).ticks(9);

    // define line
    var valueLine = d3
      .line()
      .x(function(d) {
        // if date matches headline date, mark position on timeline
        let [dataYear, month, day] = d.DATE.split('-');
        dataYear = +dataYear;
        month = +month;
        day = +day;

        // filter for matches
        let match = headlines.filter(headline => {
          return (
            headline.startDay === day &&
            headline.startYear === dataYear &&
            headline.startMonth === month
          );
        });

        // append circles at mark on x axis
        var mark = x(d.formattedDate);
        if (match.length > 0) {
          d['headline'] = true;
          svg
            .append('circle')
            .attr('cx', mark)
            .attr('cy', height)
            .attr('fill', '#4800ff')
            .attr('r', 5);
        }

        return mark;
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
        d.formattedDate = parseDate(d.DATE);
        d.NUM_MISSIONS = +d.NUM_MISSIONS;
      });

      // scaling data range
      x.domain(
        d3.extent(data, function(d) {
          return d.formattedDate;
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

      // append headline markers

      // append circle
      focus
        .append('circle')
        .attr('class', 'y')
        .style('fill', '#4800ff')
        .style('stroke', '#4800ff')
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
        .attr('dy', '-.6em');

      // place the date at the intersection
      focus
        .append('text')
        .attr('class', 'y3')
        .style('opacity', 0.8)
        .attr('dx', 3)
        .attr('dy', '-1.5em');

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.formattedDate > d1.formattedDate - x0 ? d1 : d0;

        // update props on hover
        let [dataYear, month, day] = d.DATE.split('-');
        dataYear = +dataYear;
        month = +month;
        day = +day;

        props.updateProps({
          day: day,
          month: month,
          year: dataYear
        });

        focus
          .select('circle.y')
          .attr(
            'transform',
            'translate(' + x(d.formattedDate) + ',' + y(d.NUM_MISSIONS) + ')'
          );

        focus
          .select('.x')
          .attr(
            'transform',
            'translate(' + x(d.formattedDate) + ',' + y(d.NUM_MISSIONS) + ')'
          )
          .attr('y2', height - y(d.NUM_MISSIONS));

        // Return the correlated missions value
        focus
          .select('text.y1')
          .attr(
            'transform',
            'translate(' + x(d.formattedDate) + ',' + y(d.NUM_MISSIONS) + ')'
          )
          .text(d.NUM_MISSIONS + ' ' + 'missions');

        // Return correlated date value
        focus
          .select('text.y3')
          .attr(
            'transform',
            'translate(' + x(d.formattedDate) + ',' + y(d.NUM_MISSIONS) + ')'
          )
          .text(formatDate(d.formattedDate));
      }
    });
  }

  update(props, oldProps) {
    this.play = props.play;
    if (!this.play) {
      this.svg.select('rect').style('pointer-events', 'none');
    } else {
      this.svg.select('rect').style('pointer-events', 'all');
    }
  }
}

module.exports = LineChart;
