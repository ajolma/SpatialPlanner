import React, { Component } from 'react';
import './App.css';
import { Form, Radio, Image, Button } from 'semantic-ui-react';
import { Map, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import openSocket from 'socket.io-client';
import LoginForm from './components/LoginForm';
import Legend from './components/Legend';
import CreatorLegend from './components/CreatorLegend';
import LayerForm from './components/LayerForm';
import SearchTool from './components/SearchTool';

class App extends Component {

    colors = {
        all: ["Aqua","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGrey","DodgerBlue","FireBrick","ForestGreen","Fuchsia","Gainsboro","Gold","GoldenRod","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","LawnGreen","LightBlue","LightCoral","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSteelBlue","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MistyRose","Moccasin","Navy","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGreen","PaleTurquoise","PaleVioletRed","Peru","Pink","Plum","PowderBlue","Purple","RebeccaPurple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","Sienna","Silver","SkyBlue","SlateBlue","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Yellow","YellowGreen"],
        notUsed: []
    }

    constructor(props) {
        super(props);
        this.state = {
            mode: "Browse",
            tags: [], // all tags in database
            creators: [], // all (public?) creators in database
            layers: [], // {tag, tags, creator, geometries, color}
            messageFromServer: "",
            // below is set only if logged in
            isLoggedIn: false,
            username: "",
            token: "",
            userLayers: [] // {tags, geometries, color}
        };
    }

    getUserLayers = () => {
        let obj = {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type":"application/json",
                token: this.state.token
            }
        };
        fetch("/api/layers", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((layers) => {
                    for (let i = 0; i < layers.length; i++) {
                        layers[i].color = this.colors.all[i];
                    }
                    let newLayers = this.state.userLayers;
                    newLayers.push(...layers);
                    this.setState({
                        userLayers: newLayers
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
        for (let i = 0; i < this.state.userLayers.lenght; i++) {
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

    changeMode = (e, {value}) => {
        console.log(value);
        this.setState({
            mode: value
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

    addLayer = (layer) => {
        console.log("add layer");
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

    onMessage = (message) => {
        this.setState({
            messageFromServer: message
        });
    }

    componentDidMount() {

        let self = this;
        const socket = openSocket('http://localhost:3001'); // TODO: set to proxy from package.json
        socket.on('message', function(message) {
            console.log("message: "+message);
            self.onMessage(message);
        });
        socket.emit('subscribe to messages', 5000);
        
        let obj = {
            method: "GET",
            mode: "cors",
            headers: {"Content-Type":"application/json"}
        };
        fetch("/tags", obj).then((response) => { // 200-499
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
        fetch("/creators", obj).then((response) => { // 200-499
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
            this.setState({
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
        fetch("/logout", obj).then((response) => { // 200-499
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
            radio,
            login,
            layerForm,
            legend;
        if (this.state.isLoggedIn) {
            radio = (
                <Form.Group>
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
                </Form.Group>);
            login = (
                <Button onClick={this.logout}
                        name="logout">Logout ({this.state.username})
                </Button>);
        } else {
            radio = '';
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
              <Form>
                <Form.Group>
                  <Form.Field>
                    <Image src='logo.png'/>
                  </Form.Field>
                  {radio}
                  {login}
                </Form.Group>
              </Form>
              <Map center={position} zoom={10}>
                <TileLayer url={tiles.url} attribution={tiles.attribution}/>
                {polygons}
                {fg}
              </Map>
              <div className="right">
                {layerForm}
                <br/>
                {legend}
              </div>
            </div>
    );
  }
}

export default App;
