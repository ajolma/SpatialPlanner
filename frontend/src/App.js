import React, { Component } from 'react';
import './App.css';
import { Form, Radio, Image, Button } from 'semantic-ui-react';
import { Map, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import LoginForm from './components/LoginForm';
import Legend from './components/Legend';
import SearchTool from './components/SearchTool';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            username: "",
            mode: "Browse",
            token: "",
            creators: [],
            polygons: [],
            tags: ["tag1", "tag2"],
            tag: "",
            layers: [] // {tag, tags, creator, areas, color}
        };
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

    changeMode = (e, {value}) => {
        console.log(value);
        this.setState({
            mode: value
        });
    }

    newTags = (e) => {
        console.log(e.target);
        this.setState({
            tags: e.target.value.split(", ")
        });
    }

    onSave = (event) => {
        event.preventDefault();
        this.setState({polygons:this.polygons});
        if (this.featureGroupInEdit) {
            this.featureGroupInEdit.leafletElement.clearLayers();
        }
        for (let i = 0; i < this.polygons.length; i++) {
            let request = {
                creator: this.state.username,
                area: {
                    type: "Polygon",
                    coordinates: [this.polygons[i]]
                },
                tags: this.state.tags
            };
            let obj = {
                method:"POST",
                mode:"cors",
                headers:{
                    "Content-Type":"application/json",
                    "token":this.state.token
                },
                body:JSON.stringify(request)
            };
            fetch("/api/areas", obj).then((response) => { // 200-499
                if (response.ok) {
                    response.json().then((data) => {
                        //
                    });
                } else {
                    console.log("Server responded with status: "+response.status);
                }
            }).catch((error) => { // 500-599
                console.log(error);
            });
        }
    }

    addLayer = (layer) => {
        console.log(layer);
        let layers = this.state.layers;
        layers.push(layer);
        this.setState({
            layers: layers
        });
        
    }

    componentDidMount() {
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
        this.getUsers();
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
        fetch("/logout", obj).then((response) => { // 200-499
            this.setState({
                isLoggedIn: false,
                token: ""
            });
            this.setSessionStorage(false, "", "");
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
        for (let i = 0; i < this.state.layers.length; i++) {
            let areas = this.state.layers[i].areas.map(
                (item, index) => <Polygon key={index}
                                          color={this.state.layers[i].color}
                                          positions={item.area.coordinates} />);
            polygons.push(...areas);
        }
        let fg = '';
        if (this.state.mode === 'Add') {
            fg = (
                <FeatureGroup ref={ (reactFGref) => {this.onFeatureGroupReady(reactFGref);}}>
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
        }
        let radio = '';
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
        }
        let login_or_save = '';
        if (this.state.isLoggedIn) {
            if (this.state.mode === 'Add') {
                login_or_save = (
                    <Form.Group>
                      <Form.Field>
                        <input type="text"
                               name="tags"
                               value={this.state.tags.join(", ")}
                               onChange={this.newTags}/>
                      </Form.Field>
                      <Form.Field>
                        <Button onClick={this.onSave}
                                name="save">Save
                        </Button>
                        <Button onClick={this.logout}
                                name="logout">Logout ({this.state.username})
                        </Button>
                      </Form.Field>
                    </Form.Group>);
            } else {
                login_or_save = (<Button onClick={this.logout}
                                         name="logout">Logout ({this.state.username})
                                 </Button>);
            }
        } else {
            login_or_save = (
                <LoginForm login={this.login}/>);
        }
        return (
            <div className="App">
              <Form>
                <Form.Group>
                  <Form.Field>
                    <Image src='logo.png'/>
                  </Form.Field>
                  {radio}
                  {login_or_save}
                </Form.Group>
              </Form>
              <Map center={position} zoom={10}>
                <TileLayer url={tiles.url} attribution={tiles.attribution}/>
                {polygons}
                {fg}
              </Map>
              <div className="right">
                <SearchTool tags={this.state.tags}
                            creators={this.state.creators}
                            addLayer={this.addLayer}/>
                <Legend layers={this.state.layers}/>
              </div>
            </div>
    );
  }
}

export default App;
