import React from 'react';
import ReactMapboxGl, { Layer, GeoJSONLayer, Feature, Popup } from "react-mapbox-gl";
import nearestPoint from '@turf/nearest-point';
import { point, featureCollection } from '@turf/helpers';

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
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          23.959021610961372,
          49.80922878085707
        ]
      },
      "properties": {
        "title": "Marker2",
        "description": "marker2 description",
        "score": 0
      }
    }
  ]
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      center: [24.000906986937594, 49.80259820083478],
      zoom: [11],
      markers: null,
      selectedMarker: null,
      selectedMarkerIndex: null,
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

  onAddMarker(coords) {
    if (coords) {
      const { lng, lat } = coords;
      const newMarker = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
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
        zoom: [14],
      }));
    }
  }

  getMarkerIndex() {
    const { markers, selectedMarker } = this.state;
    const markersCoords = markers.map(marker => marker.geometry.coordinates);

    return markersCoords.findIndex(coords => {
      return coords[0] === selectedMarker.geometry.coordinates[0] &&
        coords[1] === selectedMarker.geometry.coordinates[1]
    });
  }

  onRemoveMarker() {
    const selectedMarkerIndex = this.getMarkerIndex();

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
    const selectedMarkerIndex = this.getMarkerIndex();

    if (selectedMarkerIndex >= 0) {
      const newMarkers = [...markers];
      newMarkers[selectedMarkerIndex].properties.score = value;

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

  render() {
    const { markers } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h2>Mapbox app</h2>
        </header>
        {markers &&
          <div>
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
        containerStyle={{
          height: "50vh",
          width: "50vw"
        }}
        center={center}
        zoom={zoom}
        flyToOptions={{speed: 0.8 }}
        onClick={(e, mapEvent) => this.onAddMarker(mapEvent.lngLat)}
        onDrag={() => this.onDrag()}
        >
          <Layer
            type="symbol"
            layout={{ "icon-image": "castle-15" }}
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

      for (let i = 0; i <= 5; i++) {
        options.push(<option key={i} value={i}>{i}</option>);
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
            draggable={false}
            coordinates={marker.geometry.coordinates}
            properties={marker.properties}
            onMouseEnter={(e) => this.onMarkerHover(e, marker)}
            onMouseLeave={(e) => this.onMarkerNotHover(e, marker)}
          />
        );
      })
  }

  renderMarkersInfo() {
    return (
      <div>
        <h3>Markers score info:</h3>
        <table>
          <thead>
            <th>
              <td>Score</td>
              <td>Amount</td>
            </th>
          </thead>
          <tbody>
            <tr>
              <td>Total</td>
              <td>{this.state.markers.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default App;
