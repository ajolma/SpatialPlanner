import React, { Component } from 'react';
import './App.css';
import { Map, TileLayer, Polygon } from 'react-leaflet';

class App extends Component {
    render() {
        let tiles = {
            url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: "&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        };
        let position = [60, 25];
        let polygon = [
            [
                24.4940185546875,
                60.16884161373975
            ],
            [
                24.27978515625,
                60.073063025173276
            ],
            [
                24.312744140625,
                59.89995826181929
            ],
            [
                24.598388671874996,
                59.84757420214579
            ],
            [
                24.884033203125,
                59.96051043886046
            ],
            [
                24.884033203125,
                60.08950200748712
            ],
            [
                24.76318359375,
                60.19888593179811
            ]
        ];
        for (let i = 0; i < polygon.length; i++) {
            let temp = polygon[i][0];
            polygon[i][0] = polygon[i][1];
            polygon[i][1] = temp;
        }
        //        position = [51.505, -0.09];
        // polygon = [[51.515, -0.09], [51.52, -0.1], [51.52, -0.12]];
        return (
            <div className="App">
              <Map center={position} zoom={10}>
                <TileLayer url={tiles.url} attribution={tiles.attribution}/>
                <Polygon color="purple" positions={polygon} />
              </Map>
        </div>
    );
  }
}

export default App;
