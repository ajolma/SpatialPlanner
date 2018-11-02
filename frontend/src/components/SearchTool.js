import React from 'react';
import {Form,Button,Dropdown} from 'semantic-ui-react';

export default class SearchTool extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tag: "",
            tags: [],
            creator: "",
            color: ""
        };
    }
    
    onChange = (event) => {
        let o = {};
        o[event.target.name] = event.target.value;
        this.setState(o);
    }

    onChange2 = (event, data) => {
        let o = {};
        o[data.name] = data.value;
        this.setState(o);
    }

    onSubmit = (event) => {
        event.preventDefault();
        let layer = {
            tag: this.state.tag,
            tags: this.state.tags,
            creator: this.state.creator ? this.state.creator : "any",
            color: this.state.color ? this.state.color : this.props.colors.notUsed[0],
            geometries: []
        };
        let obj = {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type":"application/json"
                //"token":this.props.token if the user wants her own layers
            }
        };
        let url = "/layers?tag="+layer.tag;
        if (layer.tags.length > 0) {
            url += "&tags=" + layer.tags.join(",");
        }
        if (layer.creator) {
            url += "&creator=" + layer.creator;
        }
        fetch(url, obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        for (let j = 0; j < data[i].geometries.length; j++) {
                            layer.geometries.push(data[i].geometries[j]);
                        }
                    }
                    this.props.addLayer(layer);
                });
            } else {
                console.log("Server responded with status: "+response.status);
            }
        }).catch((error) => { // 500-599
            console.log(error);
        });
    }

    render() {
        let tags = this.props.tags.map(
            (tag, i) => {return {key: i, text: tag, value: tag};});
        let creators = this.props.creators.map(
            (creator, i) => {return {key: i, text: creator, value: creator};});
        let colors = [];
        this.props.colors.notUsed = [];
        for (let i = 0; i < this.props.colors.all.length; i++) {
            let color = this.props.colors.all[i];
            let used = false;
            for (let j = 0; j < this.props.layers.length; j++) {
                if (this.props.layers[j].color === color) {
                    used = true;
                    break;
                }
            }
            if (!used) {
                colors.push({key: i, text: color, value: color});
                this.props.colors.notUsed.push(color);
            }
        }
        return (
            <Form>
              <Form.Field>
                <label>Tag</label>
                <Dropdown name="tag"
                          placeholder='Tag' fluid selection
                          options={tags}
                          value={this.state.tag}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Form.Field>
                <label>Require additional tags</label>
                <Dropdown name="tags"
                          key="tags"
                          placeholder='Tags' fluid selection multiple
                          options={tags}
                          value={this.state.tags}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Form.Field>
                <label>Require creator</label>
                <Dropdown name="creator"
                          key="creator"
                          placeholder='Creator' fluid selection
                          options={creators}
                          value={this.state.creator}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Form.Field>
                <label>Color for the layer</label>
                <Dropdown name="color"
                          key="color"
                          placeholder='Layer color' fluid selection
                          options={colors}
                          value={this.state.color}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Button onClick={this.onSubmit}
                      name="save">Add layer</Button>
            </Form>
        );
    }
    
}
