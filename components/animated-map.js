/// app.js
import React, { Component } from 'react';
import MapGL, { FlyToInterpolator } from 'react-map-gl';
import DeckGL, { LineLayer, ArcLayer, ScatterplotLayer } from 'deck.gl';
const Papa = require('papaparse');

const fetchStatus = {
  PENDING: 'PENDING',
  FETCHED: 'FETCHED',
  REMOTE: 'REMOTE'
};

const MIN_YEAR = 1965;
const MAX_YEAR = 1975;

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibWF0aGlzb25pYW4iLCJhIjoiY2l5bTA5aWlnMDAwMDN1cGZ6Y3d4dGl6MSJ9.JZaRAfZOZfAnU2EAuybfsg';

let initialViewport;

const asiaVP = {
  latitude: 15.8700,
  longitude: 102.0865,
  pitch: 0,
  zoom: 4,
  bearing: 0
};

class App extends Component {
  constructor(props) {
    super(props);

    this.getViewport = v => {
      let vp = Object.assign({}, asiaVP);
      if (this.props.isMobile) {
        vp.zoom = vp.zoom - 1;
      }
      return vp;
    };

    initialViewport = Object.assign({
      latitude: 0,
      longitude: 0,
      zoom: 1,
      maxZoom: 16,
      pitch: 0,
      bearing: 0,
      transitionDuration: 5000,
      transitionInterpolator: new FlyToInterpolator()
    }, asiaVP);

    this.state = {
      viewport: initialViewport,
      initialized: false,
      transitioning: false
    };

    this.dataFetchMap = {};
    for (var i = MIN_YEAR; i <= MAX_YEAR; i++) {
      this.dataFetchMap[i] = fetchStatus.REMOTE;
    }
    this.data = {};
  }

  fetchData(year, cb) {
    // Stream big file in worker thread
    if (this.dataFetchMap[+year] !== fetchStatus.REMOTE) {
      return;
    }
    this.dataFetchMap[+year] = fetchStatus.PENDING;
    console.log('fetching year', year);
    Papa.parse(`static/data/by-year/${year}.csv`, {
      // worker: true,
      delimiter: ',',
      download: true,
      fastMode: true,
      step: results => {
        results.data.forEach(d => {
          let [dataYear, month, day] = d[0].split('-');
          dataYear = +dataYear;
          month = +month;
          day = +day;

          this.data[dataYear] = this.data[dataYear] || {};
          this.data[dataYear][month] = this.data[dataYear][month] || {};
          this.data[dataYear][month][+day] = this.data[dataYear][month][day] || [];
          this.data[dataYear][month][+day].push({
            lon: +d[2],
            lat: +d[1]
          }, 0);
        });
      },
      complete: () => {
        this.dataFetchMap[+year] = fetchStatus.FETCHED;
        console.log('completed fetching year', year);
        cb && cb();
      }
    });
  }

  _resize() {
    console.log('resize', this.ref.getBoundingClientRect().width);
    this._onChangeViewport({
      width: this.ref ? this.ref.getBoundingClientRect().width : 400,
      height: window.innerHeight / 2
    });
  }

  _onChangeViewport(viewport) {
    console.log('change viewport');
    this.setState({
      viewport: Object.assign({}, this.state.viewport, viewport)
    });
  }

  componentDidMount() {
    if (!this.ref) {
      return;
    }
    this.fetchData(1965, () => {
      this.setState({
        initialized: true
      });
      this.fetchData(1966, () => {});
    });
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  componentDidUpdate() {
    const year = +this.props.year
    if (this.dataFetchMap[year] === fetchStatus.REMOTE) {
      this.fetchData(year, () => {
        if (year < MAX_YEAR && this.dataFetchMap[year + 1] === fetchStatus.REMOTE) {
          this.fetchData(year + 1, () => {});
        }
      })
    } else if (year < MAX_YEAR && this.dataFetchMap[year + 1] === fetchStatus.REMOTE) {
      this.fetchData(year + 1, () => {});
    }
  }

  // componentWillReceiveProps(newProps) {
  //   // if (newProps.focus !== this.props.focus) {
  //   //   if (newProps.focus) {
  //   //     this.setState({
  //   //       viewport: Object.assign({}, this.state.viewport, this.getViewport(newProps.focus) || {})
  //   //     })
  //   //   } else {
  //   //     this.setState({
  //   //       viewport: Object.assign({}, this.state.viewport, initialViewport)
  //   //     })
  //   //   }
  //   // } else if (newProps.stepFocus !== this.props.stepFocus) {
  //   //   if (newProps.stepFocus) {
  //   //     this.setState({
  //   //       viewport: Object.assign({}, this.state.viewport, this.getViewport(newProps.stepFocus) || {})
  //   //     })
  //   //   } else {
  //   //     this.setState({
  //   //       viewport: Object.assign({}, this.state.viewport, initialViewport)
  //   //     })
  //   //   }
  //   // }
  // }

  getLayers() {
    console.log('getting layers');
    const { day, month, year } = this.props;
    let daysData;
    try {
      daysData = this.data[year][month][day];
    } catch (e) {
      console.log('no data for ', year, month, day, ':(');
      return [];
    }
    // // console.log('daysData', daysData);
    // const pointData = daysData
    //   .map((d, i) => {
    //     console.log([d.lon, d.lat]);
    //     const ret = {
    //       coordinates: [d.lon, d.lat],
    //       color: [239, 239, 239],
    //       opacity: 1
    //     }
    //     if (i < 5) {
    //       console.log(ret);
    //     }
    //     return ret;
    //   })
    // // }

    // console.log('pointData', pointData);

    const points = new ScatterplotLayer({
      id: 'points',
      strokeWidth: 1,
      opacity: 1,
      data: daysData,
      pickable: false,
      // color: ,
      getColor: d => [255, 229, 51],
      // radiusScale: 10000,
      getPosition: d => [d.lon, d.lat],
      getRadius: d => 2,
      radiusMinPixels: 2
      // onHover: ({object}) => alert(`${object.venue}`)
    });

    return [points];
  }

  _initialize(gl) {
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    // gl.blendEquation(gl.FUNC_ADD);
    // this.props.updateProps({ stepperIndex: this.props.stepperIndex + 1  });
    this.props.updateProps({ isLoaded: true });
  }

  handleRef(_ref) {
    if (!_ref) {
      return;
    }
    this.ref = _ref;
    // this._resize();
  }

  render() {
    const { viewport, initialized, transitioning } = this.state;

    return (
      <div key={'map'} ref={this.handleRef.bind(this)} style={{width: '100%'}}>
        <MapGL
          {...viewport}
          // {...tweenedViewport}
          mapStyle='mapbox://styles/mathisonian/cjurw8owq15tb1fomkfgdvycn'
          dragRotate={false}
          scrollZoom={false}
          // onViewportChange={_onChangeViewport}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        >
          <DeckGL
            {...viewport} /*{...tweenedViewport}*/
            layers={this.getLayers()}
            onWebGLInitialized={this._initialize.bind(this)}
          />
        </MapGL>
      </div>
    );
  }
}

module.exports = App;
