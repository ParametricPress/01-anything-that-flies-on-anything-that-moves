/// app.js
import React, { Component } from 'react';
import MapGL, { FlyToInterpolator } from 'react-map-gl';
import DeckGL, { LineLayer, ArcLayer, ScatterplotLayer } from 'deck.gl';
const Papa = require('papaparse');

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibWF0aGlzb25pYW4iLCJhIjoiY2l5bTA5aWlnMDAwMDN1cGZ6Y3d4dGl6MSJ9.JZaRAfZOZfAnU2EAuybfsg';

let initialViewport;

const asiaVP = {
  latitude: 12.8797,
  longitude: 121.774,
  pitch: 0,
  zoom: 3,
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
    });

    this.state = {
      viewport: initialViewport,
      initialized: false,
      transitioning: false
    };
  }

  fetchData() {
    // Stream big file in worker thread
    this.data = {};
    Papa.parse('static/data/results1.csv', {
      // worker: true,
      delimiter: ',',
      download: true,
      fastMode: true,
      step: results => {
        results.data.forEach(d => {
          let [year, month, day] = d[0].split('-');
          year = +year;
          month = +month;
          day = +day;

          this.data[year] = this.data[year] || {};
          this.data[year][month] = this.data[year][month] || {};
          this.data[year][month][+day] = this.data[year][month][day] || [];
          this.data[year][month][+day].push({
            lon: +d[2],
            lat: +d[1]
          });
        });
      },
      complete: () => {
        console.log('parsing completed');
        console.log(this.data);
        this.setState({
          initialized: true
        });
      }
    });
  }

  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight / 2
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: Object.assign({}, this.state.viewport, viewport)
    });
  }
  componentDidMount() {
    this._resize();
    this.fetchData();
    window.addEventListener('resize', this._resize.bind(this));
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
      getColor: d => [77, 0, 255],
      // radiusScale: 10000,
      getPosition: d => [d.lon, d.lat],
      // getRadius: d => 3,
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

  render() {
    const { viewport, initialized, transitioning } = this.state;
    if (!initialized) {
      return <div className='idyll-loading'>Loading dataset...</div>;
    }

    const _onChangeViewport = this._onChangeViewport.bind(this);

    // console.log(this.props.data, this.getLayers());
    return (
      <MapGL
        {...viewport}
        // {...tweenedViewport}
        mapStyle='mapbox://styles/mapbox/dark-v9'
        // dragRotate={true}
        onViewportChange={_onChangeViewport}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
      >
        <DeckGL
          {...viewport} /*{...tweenedViewport}*/
          layers={this.getLayers()}
          onWebGLInitialized={this._initialize.bind(this)}
        />
      </MapGL>
    );
  }
}

module.exports = App;
