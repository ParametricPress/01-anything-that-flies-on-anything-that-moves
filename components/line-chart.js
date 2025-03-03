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
    var margin = { top: 10, right: 10, bottom: 25, left: 10 };
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
    let r = d3.scaleSqrt().range([2, 10]);
    var loessScale = d3
      .scaleLinear()
      .domain([-1.5, 1.5])
      .range([height, 0]);

    // define axes
    var xAxis = d3.axisBottom(x).ticks(9);

    drawLegend();

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
            .attr('fill', match[0].us ? 'pink' : '#5DA391')
            .attr('r', 6);
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

    // Maps dates to num missions
    let dateMap = (this.dateMap = new Map());

    d3.csv('static/data/date_counts.csv', (error, data) => {
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
      r.domain([
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

      let focus = (this.focus = svg.append('g').style('display', 'none'));

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

      // add x dashed line
      focus
        .append('line')
        .attr('class', 'x')
        .style('stroke', '#5DA391')
        .style('stroke-width', 3)
        .style('stroke-dasharray', '3,3')
        .style('opacity', 1)
        .attr('y1', 0)
        .attr('y2', height);

      // append circle
      focus
        .append('circle')
        .attr('class', 'y')
        .style('fill', 'rgb(255, 229, 51)')
        .style('stroke', 'rgb(255, 229, 51)')
        .style('opacity', 1)
        .attr('r', 5);
      // place the value at the intersection
      focus
        .append('text')
        .attr('class', 'y1')
        .style('opacity', 1)
        .style('font-size', 12)
        .style('fill', '#fff')
        .attr('dx', 3)
        .attr('dy', '-.6em');

      // place the date at the intersection
      focus
        .append('text')
        .attr('class', 'y3')
        .style('opacity', 1)
        .style('fill', '#fff')
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
          .attr('r', r(d.NUM_MISSIONS))
          .attr(
            'transform',
            'translate(' + x(d.formattedDate) + ',' + y(d.NUM_MISSIONS) + ')'
          )
          .style('cursor', 'pointer');

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
            'translate(' +
              (dataYear === 1973
                ? x(d.formattedDate) - 80
                : x(d.formattedDate) + (d.NUM_MISSIONS < 1800 ? 0 : 10)) +
              ',' +
              (d.NUM_MISSIONS < 1800 ? y(d.NUM_MISSIONS) : 45) +
              ')'
          )
          .text(d.NUM_MISSIONS + ' ' + 'missions');

        // Return correlated date value
        focus
          .select('text.y3')
          .attr(
            'transform',
            'translate(' +
              (dataYear === 1973
                ? x(d.formattedDate) - 115
                : x(d.formattedDate) + (d.NUM_MISSIONS < 1800 ? 0 : 10)) +
              ',' +
              (d.NUM_MISSIONS < 1800 ? y(d.NUM_MISSIONS) : 45) +
              ')'
          )
          .text(formatDate(d.formattedDate));
      }
    });

    function drawLegend() {
      svg
        .append('g')
        .attr('class', 'legend')
        .append('circle')
        .attr('cx', width - 100)
        .attr('cy', 10)
        .attr('fill', '#5DA391')
        .attr('r', 4);

      svg
        .select('.legend')
        .append('circle')
        .attr('cx', width - 100)
        .attr('cy', 25)
        .attr('fill', 'pink')
        .attr('r', 4);

      svg
        .select('.legend')
        .append('text')
        .attr('x', width - 93)
        .attr('y', 15)
        .text('Bombing Related Events')
        .attr('fill', 'white')
        .style('font-size', '0.4em');

      svg
        .select('.legend')
        .append('text')
        .attr('x', width - 93)
        .attr('y', 30)
        .text('Events in the US')
        .attr('fill', 'white')
        .style('font-size', '0.4em');
    }

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
        .style('stroke', '#5DA391')
        .style('stroke-width', 3)
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
        .style('fill', 'rgb(255, 229, 51)')
        .style('stroke', 'rgb(255, 229, 51)')
        .style('opacity', 1)
        .attr('cx', newX)
        .attr('cy', newY)
        .attr('r', r(numMissions));
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
