// Reference: https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-starting-with-a-basic-graph

const D3Component = require('idyll-d3-component');
const d3 = require('d3');
import { headlines } from './headline-data.js';

// const science = require('science');
// const loess = science.stats.loess().bandwidth(.2);

const Loess = require('loess').default;
const options = { span: 0.2, band: 0, degree: 'constant' };

const size = 100;

class LineChart extends D3Component {
  initialize(node, props) {
    this.play = props.play;

    let svg = (this.svg = d3
      .select(node)
      .append('svg')
      .style('overflow', 'visible'));
    var margin = { top: 10, right: 0, bottom: 25, left: 0 };
    let width = 1200 - margin.left - margin.right;
    let height = 150 - margin.top - margin.bottom;

    // Parse the date
    let parseDate = d3.timeParse('%Y-%m-%d');
    var formatDate = d3.timeFormat('%b %d %Y');

    // Returns value in array data that matches horiz position of der
    var bisectDate = d3.bisector(function(d) {
      return d.formattedDate;
    }).left;

    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);
    var loessScale = d3
      .scaleLinear()
      .domain([-1.5, 1.5])
      .range([height, 0]);

    // define axes
    var xAxis = d3.axisBottom(x).ticks(9);

    // define line
    var valueLine = d3
      .line()
      .x(function(d, i) {
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
          svg
            .append('circle')
            .attr('cx', mark)
            .attr('cy', y(props.loessFit[i]))
            .attr('fill', '#5DA391')
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

    let focus = (this.focus = svg.append('g').style('display', 'none'));

    let dateMap = (this.dateMap = new Map());

    d3.csv('static/data/date_counts.csv', function(error, data) {
      data.forEach(function(d) {
        d.formattedDate = parseDate(d.DATE);
        d.NUM_MISSIONS = +d.NUM_MISSIONS;
        dateMap.set(d.DATE, d.NUM_MISSIONS);
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

      const loessLine = d3
        .line()
        .x(function(d, i) {
          return x(data[i].formattedDate);
        })
        .y(function(d, i) {
          return y(d);
        });

      // path and x axis
      lineSvg
        .append('path')
        .attr('class', 'loess')
        .attr('d', loessLine(props.loessFit));
      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

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
        svg.selectAll('.animated-line').remove(); // on mousemove delete line

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

    // Given current props of month, day, year,
    // draws line on timeline corresponding to current date
    function drawLine(props) {
      // draws animated line on playback
      var month = props.month + '';
      var day = props.day + '';
      if (props.month < 10) {
        month = '0' + month;
      }
      if (props.day < 10) {
        day = '0' + day;
      }
      var strDate = props.year + '-' + month + '-' + day;
      var newDate = parseDate(strDate);

      var numMissions = dateMap.get(strDate);
      var newX = x(newDate);
      var newY = y(numMissions);

      // Remove line
      svg.selectAll('.animated-line').remove();

      // redraw animated line and circle
      svg
        .append('line')
        .attr('class', 'animated-line')
        .style('stroke', '#c5c5c5')
        .style('stroke-dasharray', '3,3')
        .style('opacity', 1)
        .attr('x1', newX)
        .attr('y1', height)
        .attr('x2', newX)
        .attr('y2', newY);

      // draw circle
      svg
        .append('circle')
        .attr('class', 'animated-line')
        .style('fill', '#4800ff')
        .style('stroke', '#4800ff')
        .style('opacity', 0.7)
        .attr('cx', newX)
        .attr('cy', newY)
        .attr('r', 3);

      // draw text
      // svg
      //   .append('text')
      //   .attr('class', 'animated-line')
      //   .attr('x', newX + 3)
      //   .attr('y', newY - 5)
      //   .text(numMissions + ' missions');
    }
    this.drawLine = drawLine;
  }

  update(props, oldProps) {
    this.play = props.play;
    if (!this.play) {
      this.svg.select('rect').style('pointer-events', 'none');

      this.drawLine(props);
    } else {
      this.svg.select('rect').style('pointer-events', 'all');
    }
  }
}

module.exports = LineChart;
