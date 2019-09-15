import React from 'react';
import ReactMapboxGl, { Layer, GeoJSONLayer, Feature, Popup } from "react-mapbox-gl";

import './App.css';

const accessToken = "pk.eyJ1IjoiZ3J5Z29yaWkiLCJhIjoiY2swZ3QzdXhuMDQzdTNpbGpoY24zaTY4diJ9.El3swWKoso1paibm4U_F3Q";
const geojson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          24.000906986937594,
          49.80259820083478
        ]
      },
      "properties": {
        "title": "Marker1",
        "description": "marker1 description",
        "score": 0
      }
    }
  ]
}
const markerScoresConfig = {
  0: {
    label: 'Zero',
    color: 'black'
  },
  1: {
    label: 'One',
    color: 'grey'
  },
  2: {
    label: 'Two',
    color: 'red'
  },
  3: {
    label: 'Three',
    color: 'orange'
  },
  4: {
    label: 'Four',
    color: 'lime'
  },
  5: {
    label: 'Five',
    color: 'green'
  },
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      center: [24.000906986937594, 49.80259820083478],
      zoom: [14],
      markers: null,
      selectedMarker: null,
    }

    this.Mapbox = ReactMapboxGl({
      minZoom: 8,
      maxZoom: 15,
      accessToken
    });
  }

  componentDidMount() {
    const mapData = geojson;

    this.setState({
      markers: mapData.features
    })
  }

  onAddMarker(mapEvent) {
    const { lng, lat } = mapEvent.lngLat;
    const coords = [lng, lat];

    if (coords) {
      const newMarker = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
        properties: {
          title: "",
          description: "",
          score: 0,
        }
      }

      this.setState(prevState => ({
        markers: [...prevState.markers, newMarker],
        selectedMarker: newMarker,
        center: coords,
        zoom: [15],
      }));
    }
  }

  onRemoveMarker() {
    const selectedMarkerIndex = this._getMarkerIndex();

    if (selectedMarkerIndex >= 0) {
      const newMarkers = [...this.state.markers];
      newMarkers.splice(selectedMarkerIndex, 1);
      this.setState({
        markers: newMarkers
      })
    }
    this.onClosePopup();
  }

  onClosePopup() {
    this.setState({
      selectedMarker: null,
    })
  }

  onChangeMarkerScore(value) {
    const { markers } = this.state;
    const selectedMarkerIndex = this._getMarkerIndex();

    if (selectedMarkerIndex >= 0) {
      const newMarkers = [...markers];
      newMarkers[selectedMarkerIndex].properties.score = +value;

      this.setState({
        markers: newMarkers
      })
    }
  }

  onMarkerHover(mapEvent, marker) {
    mapEvent.map.getCanvas().style.cursor = 'pointer';

    this.setState({
      selectedMarker: marker,
    })
  }

  onMarkerNotHover(mapEvent) {
    mapEvent.map.getCanvas().style.cursor = '';
  }

  onDrag() {
    if (this.state.selectedMarker) {
      this.setState({ selectedMarker: null });
    }
  };

  onMarkerDragEnd(mapEvent) {
    const { markers } = this.state;
    const { lng, lat } = mapEvent.lngLat;
    const coords = [lng, lat];
    const selectedMarkerIndex = this._getMarkerIndex();

    if (selectedMarkerIndex >= 0 && coords) {
      const newMarkers = [...markers];
      newMarkers[selectedMarkerIndex].geometry.coordinates = coords;

      this.setState({
        markers: newMarkers,
        center: coords
      })
    }
  }

  render() {
    const { markers } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h2>Mapbox app</h2>
        </header>
        {markers &&
          <div className="wrapper">
            {this.renderMarkersInfo()}
            {this.renderMap()}
          </div>
        }
      </div>
    )
  };

  renderMap() {
    const { center, zoom, selectedMarker } = this.state;
    const Mapbox = this.Mapbox;

    return (
      <Mapbox
        style="mapbox://styles/mapbox/streets-v11"
        className="mapContainer"
        center={center}
        zoom={zoom}
        flyToOptions={{speed: 0.8 }}
        onClick={(e, mapEvent) => this.onAddMarker(mapEvent)}
        onDrag={() => this.onDrag()}
        >
          <Layer
            type="circle"
            source={{
              type: 'vector',
              url: 'mapbox://examples.8fgz4egr'
            }}
            source-layer={'sf2010'}
            paint={{
              // make circles larger as the user zooms from z12 to z22
              'circle-radius': {
                'base': 1.75,
                'stops': [[12, 2], [22, 180]]
              },
              // color circles by ethnicity, using a match expression
              // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
              'circle-color': [
                'match',
                ['get', 'score'],
                0, markerScoresConfig[0].color,
                1, markerScoresConfig[1].color,
                2, markerScoresConfig[2].color,
                3, markerScoresConfig[3].color,
                4, markerScoresConfig[4].color,
                5, markerScoresConfig[5].color,
                /* other */ 'white'
              ]
            }}
          >
            {this.renderMarkers()}
          </Layer>
          {selectedMarker && this.renderMarkerPopup()}
      </Mapbox>
    )
  }

  renderMarkerPopup() {
    const { selectedMarker } = this.state;

    if (!selectedMarker) {
      return null;
    }

    const renderOptions = () => {
      let options = [];

      for (let i = 0; i < Object.keys(markerScoresConfig).length; i++) {
        options.push(<option key={i} value={i}>{markerScoresConfig[i].label}</option>);
      }
      return options;
    }

    return (
      <Popup
        coordinates={selectedMarker.geometry.coordinates}
        offset={{
          'bottom': [0, -10],
        }}
      >
        <h4>Marker info</h4>
        <label>Score: 
          <select
            value={selectedMarker.properties.score}
            onChange={(e) => this.onChangeMarkerScore(e.target.value)}>
            {renderOptions()}
          </select>
        </label>
        <br />
        <button onClick={() => this.onClosePopup()}>Close</button>
        <button onClick={() => this.onRemoveMarker()}>Remove</button>
      </Popup>
    )
  }

  renderMarkers() {
    return this.state.markers.length > 0 &&
      this.state.markers.map((marker) => {
        return (
          <Feature
            draggable={true}
            coordinates={marker.geometry.coordinates}
            properties={marker.properties}
            onMouseEnter={(e) => this.onMarkerHover(e, marker)}
            onMouseLeave={(e) => this.onMarkerNotHover(e, marker)}
            onDragEnd={(e) => this.onMarkerDragEnd(e)}
          />
        );
      })
  }

  renderMarkersInfo() {
    const renderTbody = () => {
      const result = [];
      for (let key in markerScoresConfig) {
        result.push(
          <tr>
            <td>{markerScoresConfig[key].label}</td>
            <td>{calcScoresAmounts(key)}</td>
          </tr>
        )
      }
      return result;
    }

    const calcScoresAmounts = (score) => {
      const { markers } = this.state;

      return markers.reduce((sum, marker) => {
        if (marker.properties.score === +score) {
          return sum += 1;
        }
        return sum;
      }, 0)
    }

    return (
      <div className="markersInfo">
        <h3>Markers info</h3>
        <table>
          <thead>
            <th>
              <td>Score</td>
              <td>Amount</td>
            </th>
          </thead>
          <tbody>
            {renderTbody()}
          </tbody>
          <tfoot>
            <tr>
              <td><b>Total</b></td>
              <td><b>{this.state.markers.length}</b></td>
            </tr>
          </tfoot>
        </table>
        <button onClick={() => this.onExportData()} disabled={!this.state.markers.length}>
            Export Markers as JSON
        </button>
      </div>
    )
  }

  onExportData() {
    const { markers } = this.state;

    if (markers.length) {
      this._exportToJsonFile(markers)
    }
  }

  _getMarkerIndex() {
    const { markers, selectedMarker } = this.state;
    const markersCoords = markers.map(marker => marker.geometry.coordinates);

    return markersCoords.findIndex(coords => {
      return coords[0] === selectedMarker.geometry.coordinates[0] &&
        coords[1] === selectedMarker.geometry.coordinates[1]
    });
  }

  _exportToJsonFile(data) {
    let dataStr = JSON.stringify(data);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    let exportFileDefaultName = 'geoData.json';
    let linkElement = document.createElement('a');

    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

export default App;
