import React, { Component } from 'react';
import './App.css';
import { Form, Radio, Image, Button } from 'semantic-ui-react';
import { Map, TileLayer, FeatureGroup, Polygon, Circle } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            username: "",
            mode: "Add",
            token: "",
            users: [],
            polygons: [],
            tags: []
        };
    }

    polygons = []

    _onCreate = (e) => {
        // TODO: respond to edit etc.
        console.log(e);
        console.log(e.layer._latlngs[0]);
        let p = e.layer._latlngs[0];
        let q = [];
        for (let i = 0; i < p.length; i++) {
            q.push([p[i].lat,p[i].lng]);
        }
        this.polygons.push(q);
    }

    featureGroupInEdit = null

    _onFeatureGroupReady = (group) => {
        console.log(group);
        this.featureGroupInEdit = group;
    }

    changeMode = (e, {value}) => {
        console.log(value);
        this.setState({
            mode: value
        });
    }

    onChange = (e) => {
        console.log(e.target);
    }

    onSave = (event) => {
        event.preventDefault();
        this.setState({polygons:this.polygons});
        // clear FeatureGroup (the edits)
        if (this.featureGroupInEdit) {
            this.featureGroupInEdit.leafletElement.clearLayers();
        }
    }
    
    render() {
        let tiles = {
            url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        };
        let position = [60, 25];
        let polygons = this.state.polygons.map(
            (item, index) => <Polygon key={index} color="purple" positions={item} />);
        let fg = '';
        if (this.state.mode === 'Add') {
            fg = 
                (<FeatureGroup ref={ (reactFGref) => {this._onFeatureGroupReady(reactFGref);}}>
                   <EditControl
                     position='topright'
                     onEdited={this._onEditPath}
                     onCreated={this._onCreate}
                     onDeleted={this._onDeleted}
                     draw={{
                         rectangle: false
                     }}
                   />
                 </FeatureGroup>);
        }
        return (
            <div className="App">
              <Form>
                <Form.Group>
                  <Form.Field>
                    <Image src='logo.png'/>
                  </Form.Field>
                <Form.Field>
                  <Radio label='Add'
                         name='radioGroup'
                         value='Add'
                         checked={this.state.mode === 'Add'}
                         onChange={this.changeMode}/>
                </Form.Field>
                <Form.Field>
                  <Radio label='Browse'
                         name='radioGroup'
                         value='Browse'
                         checked={this.state.mode === 'Browse'}
                         onChange={this.changeMode}/>
                </Form.Field>
                {this.state.mode === 'Add' ?
                 (<Form.Group>
                    <Form.Field>
                      <input type="text"
                             name="tags"
                             value={this.state.tags.length >0 ?
                                    this.state.tags.join(", ") :
                                    "tag1, tag2, ..."}
                             onChange={this.onChange}/>
                    </Form.Field>
                    <Form.Field>
                      <Button onClick={this.onSave}
                              name="save">Save</Button>
                    </Form.Field>
                  </Form.Group>
                 ) : ''
                }
                </Form.Group>
              </Form>
              <Map center={position} zoom={10}>
                <TileLayer url={tiles.url} attribution={tiles.attribution}/>
                {polygons}
                {fg}
              </Map>
              
            </div>
    );
  }
}

export default App;
