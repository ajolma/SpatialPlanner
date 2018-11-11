import React, { Component } from 'react';
import './App.css';
import { Menu, Image } from 'semantic-ui-react';
import { Map, TileLayer, FeatureGroup, Polygon, Popup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import {connect} from 'react-redux';
import LoginForm from './components/LoginForm';
import Legend from './components/Legend';
import CreatorLegend from './components/CreatorLegend';
import LayerForm from './components/LayerForm';
import SearchTool from './components/SearchTool';
import {setBackend} from './config';
import {loginSuccess, onLogout} from './actions/loginActions';
import {addTags, addCreators} from './actions/viewerActions';
import {setMode, getLayers as getCreatorLayers} from './actions/creatorActions';

class App extends Component {

    constructor(props) {
        if (window.origin === 'http://localhost:3000') {
            setBackend('http://localhost:3001');
        } else {
            setBackend('https://spatial-planner-backend.herokuapp.com');
        }
        super(props);
    }

    changeMode = (e) => {
        console.log('changeMode to ' + e.target.textContent);
        this.props.dispatch(setMode(e.target.textContent));
    }

    polygons = []

    onCreate = (e) => {
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

    onFeatureGroupReady = (group) => {
        console.log(group);
        this.featureGroupInEdit = group;
    }

    endEdit = () => {
        if (this.featureGroupInEdit) {
            this.featureGroupInEdit.leafletElement.clearLayers();
        }
    }

    componentDidMount() {
        console.log('componentDidMount');
        this.props.dispatch(addTags());
        this.props.dispatch(addCreators());
        
        let username = sessionStorage.getItem("username");
        if (username && username !== "") {
            let token = sessionStorage.getItem("token");
            this.props.dispatch(loginSuccess(username, token));
            this.props.dispatch(getCreatorLayers(token));
            this.props.dispatch(setMode('Add'));
        }
    }

    logout = () => {
        this.endEdit();
        this.props.dispatch(onLogout(this.props.token));
        this.props.dispatch(setMode('Browse'));
    }

    render() {
        this.polygons = [];
        let isLoggedIn = this.props.username !== "",
            creatorMode = isLoggedIn && this.props.mode === 'Add',
            osmURL = 'http://osm.org/copyright',
            tiles = {
                url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                attribution: '&copy; <a href="' + osmURL + '">OpenStreetMap</a> contributors'
            },
            position = [60, 25],
            polygons = [],
            layers = creatorMode ? this.props.creatorLayers : this.props.viewerLayers;

        console.log('render app, mode='+this.props.mode+', '+layers.length+' layers');
        
        for (let i = 0; i < layers.length; i++) {
            console.log(layers[i]);
            let info = layers[i].srcInfo;
            let polygons_in_layer = layers[i].geometries.map(
                (item, index) =>
                    <Polygon key={i+"."+index}
                             color={layers[i].color}
                             positions={item.coordinates}>
                      <Popup>
                        <span>{info ?
                               JSON.stringify(info[layers[i].sources[index]]) :
                               JSON.stringify(layers[i].tags)}</span>
                      </Popup>
                    </Polygon>
            );
            polygons.push(...polygons_in_layer);
        }
        let fg = '',
            b1 = '', b2 = '',
            login,
            layerForm,
            legend;
        if (isLoggedIn) {
            b1 = <Menu.Item name='Add'
                            active={creatorMode}
                            onClick={this.changeMode}/>;
            b2 = <Menu.Item name='Browse'
                            active={!creatorMode}
                            onClick={this.changeMode}/>;
            let name = 'Logout ' + this.props.username;
            var divStyle = {
                textTransform: 'lowercase'
            };
            login = (
                <Menu.Menu position='right'>
                  <Menu.Item name={name}
                             style={divStyle}
                             onClick={this.logout}/>
                </Menu.Menu>);
        } else {
            login = <LoginForm/>;
        }
        if (creatorMode) {
            fg = (
                <FeatureGroup ref={(reactFGref) =>
                                   {this.onFeatureGroupReady(reactFGref);}
                                  }>
                  <EditControl
                    position='topright'
                    onEdited={this.onEditPath}
                    onCreated={this.onCreate}
                    onDeleted={this.onDeleted}
                    draw={{
                        rectangle: false
                    }}
                  />
                </FeatureGroup>);
            layerForm = <LayerForm polygons={this.polygons}
                                   endEdit={this.endEdit}/>;
            legend = <CreatorLegend/>;
        } else {
            layerForm = <SearchTool/>;
            legend = <Legend/>;
        }
        return (
            <div className="App">
              <Menu>
                <Menu.Item>
                  <Image src='logo.png'/>
                </Menu.Item>
                {b1}
                {b2}
                {login}
              </Menu>
              <Map center={position} zoom={10}>
                <TileLayer url={tiles.url} attribution={tiles.attribution}/>
                {polygons}
                {fg}
              </Map>
              <div className="myright">
                {layerForm}
                <br/>
                {legend}
              </div>
            </div>
    );
  }
}

const mapStateToProps = (state) => {
    return {
        username: state.login.username,
        token: state.login.token,
        mode: state.creator.mode,
        creatorLayers: state.creator.layers,
        viewerLayers: state.viewer.layers
    };
}

export default connect(mapStateToProps)(App);
