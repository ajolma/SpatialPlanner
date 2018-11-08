import React, { Component } from 'react';
import './App.css';
import { Menu, Image, Input, Button } from 'semantic-ui-react';
import { Map, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import openSocket from 'socket.io-client';
import LoginForm from './components/LoginForm';
import Legend from './components/Legend';
import CreatorLegend from './components/CreatorLegend';
import LayerForm from './components/LayerForm';
import SearchTool from './components/SearchTool';
import {backend, setBackend} from './config';

class App extends Component {

    colors = {
        all: ["Aqua","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGrey","DodgerBlue","FireBrick","ForestGreen","Fuchsia","Gainsboro","Gold","GoldenRod","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","LawnGreen","LightBlue","LightCoral","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSteelBlue","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MistyRose","Moccasin","Navy","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGreen","PaleTurquoise","PaleVioletRed","Peru","Pink","Plum","PowderBlue","Purple","RebeccaPurple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","Sienna","Silver","SkyBlue","SlateBlue","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Yellow","YellowGreen"],
        notUsed: []
    }

    constructor(props) {
        if (window.origin === 'http://localhost:3000') {
            setBackend('http://localhost:3001');
        } else {
            setBackend('https://spatial-planner-backend.herokuapp.com');
        }
        super(props);
        this.state = {
            // TODO: invent different names for viewed layers and created layers
            mode: "Browse",
            tags: [], // all tags in database
            creators: [], // all (public?) creators in database
            layers: [], // {tag, tags, creator, geometries, color}
            // below is set only if logged in
            isLoggedIn: false,
            username: "",
            token: "",
            userLayers: [] // {_id, tags, geometries, color}
        };
    }

    getUserLayers = (data) => {
        console.log('getUserLayers');
        console.log(data);
        if (!data) {
            data = {
                isLoggedIn: this.state.isLoggedIn,
                username: this.state.username,
                token: this.state.token
            };
            return;
        }
        if (!data.isLoggedIn) {
            return;
        }
        let obj = {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type":"application/json",
                token: data.token
            }
        };
        fetch(backend + "/api/layers", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((layers) => {
                    for (let i = 0; i < layers.length; i++) {
                        layers[i].color = this.colors.all[i];
                    }
                    let newLayers = this.state.userLayers;
                    newLayers.push(...layers);
                    this.setState({
                        userLayers: newLayers,
                        isLoggedIn: data.isLoggedIn,
                        token: data.token,
                        username: data.username,
                        mode: data.mode
                    });
                });
            } else {
                console.log("Server responded with status: "+response.status);
            }
        }).catch((error) => { // 500-599
            console.log(error);
        });
    }

    deleteLayer = (layer_id) => {
        let change = false;
        let newLayers = [];
        console.log("delete layer "+layer_id);
        for (let i = 0; i < this.state.userLayers.length; i++) {
            if (this.state.userLayers[i]._id !== layer_id) {
                newLayers.push(this.state.userLayers[i]);
            } else {
                change = true;
            }
        }
        if (change) {
            this.setState({
                userLayers: newLayers
            });
        }
    }

    changeMode = (e) => {
        console.log('changeMode to ' + e.target.textContent);
        this.setState({
            mode: e.target.textContent
        });
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

    newLayer = (layer) => {
        this.polygons = [];
        if (!layer) {
            return;
        }
        console.log("new layer");
        let tags = this.state.tags;
        for (let i = 0; i < layer.tags.length; i++) {
            if (tags.indexOf(layer.tags[i]) === -1) {
                tags.push(layer.tags[i]);
            }
        }
        layer.color = this.colors.all[this.state.userLayers.length];
        let layers = this.state.userLayers;
        layers.push(layer);
        this.setState({
            tags: tags,
            userLayers: layers
        });
    }

    getLayer = (layer_id, then, args) => {
        let obj = {
            method: "GET",
            mode: "cors",
            headers: {"Content-Type":"application/json"}
        };
        fetch(backend + "/layers/" + layer_id, obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((layer) => {
                    then(layer, args);
                });
            } else {
                console.log("Server responded with status: "+response.status);
            }
        }).catch((error) => { // 500-599
            console.log(error);
        });
    }

    layerMatches = (creatorLayer, args) => { // args = {myLayer, then}
        // test that all tags in myLayer are in creatorLayer
        // and that creatorLayer.creator === myLayer.creator if myLayer.creator
        //   is defined
        let matches = true;
        if (creatorLayer.tags.indexOf(args.myLayer.tag) === -1) {
            matches = false;
        }
        if (matches) {
            for (let i = 0; i < args.myLayer.tags.length; i++) {
                if (creatorLayer.tags.indexOf(args.myLayer.tags[i]) === -1) {
                    matches = false;
                    break;
                }
            }
        }
        if (matches && args.myLayer.creator) {
            if (creatorLayer.creator !== args.myLayer.creator) {
                matches = false;
            }
        }
        if (matches) {
            args.then(creatorLayer, args.myLayer);
        }
    }

    maybeAddToLayer = (layer, add) => {
        // layer is a browser layer (tag, tags, creator, geometries, color)
        // add is a creator layer (_id, tags, creator) no geometries!
        let self = this;
        this.getLayer(add._id, this.layerMatches, {
            myLayer: layer,
            then: function(layerToAdd, hostLayer) {
                // add layerToAdd into hostLayer
                // and set layers to state
                console.log("match, add");
                let newLayers = self.state.layers;
                let newSources = [];
                let newGeometries = [];
                for (let i = 0; i < hostLayer.geometries.length; i++) {
                    newSources.push(hostLayer.sources[i]);
                    newGeometries.push(hostLayer.geometries[i]);
                }
                for (let i = 0; i < layerToAdd.geometries.length; i++) {
                    newSources.push(layerToAdd._id);
                    newGeometries.push(layerToAdd.geometries[i]);
                }
                hostLayer.sources = newSources;
                hostLayer.geometries = newGeometries;
                self.setState({
                    layers: newLayers
                });
            }
        });
    }

    maybeRemoveFromLayer = (layer, remove) => {
        let self = this;
        this.layerMatches(remove, {
            myLayer: layer,
            then: function(a, b) {
                console.log("match, remove");
                let newLayers = self.state.layers;
                // remove a from b
                let newSources = [];
                let newGeometries = [];
                for (let i = 0; i < b.geometries.length; i++) {
                    if (b.sources[i] !== a._id) {
                        newSources.push(b.sources[i]);
                        newGeometries.push(b.geometries[i]);
                    }
                }
                b.sources = newSources;
                b.geometries = newGeometries;
                self.setState({
                    layers: newLayers
                });
            }          
        });
    }

    addLayer = (layer) => {
        console.log("add layer");
        let self = this;
        let socket = openSocket(backend);
        // TODO: set to proxy from package.json
        socket.emit('subscribe to channel', layer.creator + ',' + layer.tag);
        socket.on("message", function(message) {
            console.log('message from server: '+message);
            let cmd = message.slice(0, 9);
            if (cmd === "new layer") {
                message = message.replace(/^new layer: /, '');
                let add = JSON.parse(message);
                self.maybeAddToLayer(layer, add);
            }
            if (cmd === "layer del") {
                message = message.replace(/^layer deleted: /, '');
                let remove = JSON.parse(message);
                self.maybeRemoveFromLayer(layer, remove);
            }
        });
        let layers = this.state.layers;
        layers.push(layer);
        this.setState({
            layers: layers
        });
        
    }

    removeLayer = (layer_index) => {
        let layers = this.state.layers;
        layers.splice(layer_index, 1);
        this.setState({
            layers: layers
        });
    }

    componentDidMount() {
        console.log('componentDidMount');
        let obj = {
            method: "GET",
            mode: "cors",
            headers: {"Content-Type":"application/json"}
        };
        fetch(backend + "/tags", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((data) => {
                    this.setState({
                        tags: data
                    });
                });
            } else {
                console.log("Server responded with status: "+response.status);
            }
        }).catch((error) => { // 500-599
            console.log(error);
        });
        fetch(backend + "/creators", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((data) => {
                    this.setState({
                        creators: data
                    });
                });
            } else {
                console.log("Server responded with status: "+response.status);
            }
        }).catch((error) => { // 500-599
            console.log(error);
        });
        if (sessionStorage.getItem("isLoggedIn")) {
            let isLoggedIn = sessionStorage.getItem("isLoggedIn");
            let token = sessionStorage.getItem("token");
            let username = sessionStorage.getItem("username");
            this.getUserLayers({
                isLoggedIn: isLoggedIn === "true",
                token: token,
                username: username,
                mode: isLoggedIn === "true" ? "Add" : "Browse"
            });
        }
    }

    setSessionStorage = (isLoggedIn, token, username) => {
        sessionStorage.setItem("isLoggedIn", isLoggedIn ? "true" : "false");
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("username", username);
    }
    
    login = (data) => {
        this.setState({
            isLoggedIn: true,
            username: data.username,
            token: data.token,
            mode: "Add"
        });
        this.setSessionStorage(true, data.token, data.username);
        this.getUserLayers();
    }

    logout = () => {
        let obj = {
            method:"POST",
            mode:"cors",
            headers:{
                "Content-Type":"application/json",
                token:this.state.token
            },
        };
        this.setState({
            isLoggedIn: false,
            username: "",
            token: "",
            userLayers: []
        });
        this.endEdit();
        this.setSessionStorage(false, "", "");
        fetch(backend + "/logout", obj).then((response) => { // 200-499
        }).catch((error) => { // 500-599
            console.log(error);
        });
    }

    render() {
        let tiles = {
            url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        };
        let position = [60, 25];
        let polygons = [];
        let layers = this.state.mode === 'Add' ? this.state.userLayers : this.state.layers;
        for (let i = 0; i < layers.length; i++) {
            let polygons_in_layer = layers[i].geometries.map(
                (item, index) => <Polygon key={i+"."+index}
                                          color={layers[i].color}
                                          positions={item.coordinates} />);
            polygons.push(...polygons_in_layer);
        }
        let fg,
            b1, b2,
            login,
            layerForm,
            legend;
        if (this.state.isLoggedIn) {
            b1 = (
                <Menu.Item name='Add'
                           active={this.state.mode === 'Add'}
                           onClick={this.changeMode}/>
            );
            b2 = (
                <Menu.Item name='Browse'
                           active={this.state.mode === 'Browse'}
                           onClick={this.changeMode}/>
            );
            login = (
                <Menu.Menu position='right'>
                  <Menu.Item name='Logout'
                             onClick={this.logout}/>
                </Menu.Menu>);
        } else {
            b1 = '';
            b2 = '';
            login = (<LoginForm login={this.login}/>);
        }
        if (this.state.isLoggedIn && this.state.mode === 'Add') {
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
            layerForm = (
                <LayerForm tags={this.state.tags}
                           token={this.state.token}
                           polygons={this.polygons}
                           endEdit={this.endEdit}
                           newLayer={this.newLayer}/>
            );
            legend = (
                <CreatorLegend token={this.state.token}
                               layers={layers}
                               mode={this.state.mode}
                               deleteLayer={this.deleteLayer}/>
            );
        } else {
            fg = '';
            layerForm = (
                <SearchTool colors={this.colors}
                            tags={this.state.tags}
                            creators={this.state.creators}
                            layers={this.state.layers}
                            addLayer={this.addLayer}/>
            );
            legend = (
                <Legend layers={layers}
                        mode={this.state.mode}
                        removeLayer={this.removeLayer}/>
            );
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

export default App;
