import React from 'react';
import ReactMapboxGl, { Layer, GeoJSONLayer, Feature, Popup } from "react-mapbox-gl";
import nearestPoint from '@turf/nearest-point';
import { point, featureCollection } from '@turf/helpers';

import './App.css';

const accessToken = "pk.eyJ1IjoiZ3J5Z29yaWkiLCJhIjoiY2swZ3QzdXhuMDQzdTNpbGpoY24zaTY4diJ9.El3swWKoso1paibm4U_F3Q";
const currentLocationCoords = [24.000906986937594, 49.80259820083478];

var geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: currentLocationCoords
      },
      properties: {
        title: 'Marker1',
        description: 'marker1 description',
        score: 0,
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [23.959021610961372, 49.80922878085707]
      },
      properties: {
        title: 'Marker2',
        description: 'marker2 description',
        score: 0,
      }
    }
  ]
};

class App extends React.Component {
  state = {
    currentLocation: currentLocationCoords,
    markers: geojson.features,
    selectedMarker: null,
  }

  onAddMarker(coords) {
    // debugger;
    this.setState({
      selectedMarker: null,
    });

    if (coords) {
      const { lng, lat } = coords;

      this.setState(prevState => ({
        markers: [...prevState.markers, 
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          }
        ]
      }));
    }
  }

  onMarkerHover(map) {
    if (this.state.selectedMarker) {
      return;
    } else{
      console.info('hovered marker', map.feature)
      this.setState({
        selectedMarker: map.feature,
      })
    }
  }

  onRemoveMarker() {
    const {markers, selectedMarker} = this.state;
    
    const selectedPoint = point(selectedMarker.geometry.coordinates);
    const markersCollections = featureCollection(markers);
    const nearest = nearestPoint(selectedPoint, markersCollections);

    const markersCoords = markers.map(marker => marker.geometry.coordinates);
    const markerToRemoveIndex = markersCoords.findIndex(coords => {
      return coords[0] === nearest.geometry.coordinates[0] &&
        coords[1] === nearest.geometry.coordinates[1]
    });

    if (markerToRemoveIndex >= 0) {
      const newMarkers = [...this.state.markers];
      newMarkers.splice(markerToRemoveIndex, 1);
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

  render() {
    console.log('markers: ', this.state.markers);
    return (
      <div className="App">
        <header className="App-header">
          <h2>Mapbox app</h2>
          <p>
            Total markers amount: {this.state.markers.length}
          </p>
        </header>
        {this.renderMap()}
      </div>
    )
  };
  
  renderMap() {
    const Map = ReactMapboxGl({
      accessToken,
    });

    return (
      <Map
        style="mapbox://styles/mapbox/streets-v11"
        containerStyle={{
          height: "50vh",
          width: "50vw"
        }}
        center={this.state.currentLocation}
        onClick={(map, e) => this.onAddMarker(e.lngLat)}>
          {/* <GeoJSONLayer 
            data={geojson}
            symbolLayout={{
              "text-field": "{place}",
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 0.6],
              "text-anchor": "top"
            }}/> */}
          <Layer
            type="symbol"
            layout={{ "icon-image": "castle-15"}}
            >
              {this.renderMarkers()}
          </Layer>
          {this.state.selectedMarker && <Popup
            coordinates={this.state.selectedMarker.geometry.coordinates}
            offset={{
              'bottom': [0, -10],
            }}
            >
            <h4>Marker</h4>
            <p>score: 0</p>
            <button onClick={() => this.onClosePopup()}>Close</button>
            <button onClick={() => this.onRemoveMarker()}>Remove</button>
          </Popup>}
      </Map>
    )
  }

  renderMarkers() {
    return this.state.markers.length > 0 &&
      this.state.markers.map((marker, index) => {
        return (
          <Feature
            key={index}
            draggable={true}
            coordinates={marker.geometry.coordinates}
            properties={marker.properties}
            onMouseEnter={(e) => this.onMarkerHover(e)}
          />
        );
      })
  }
}

export default App;
