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
            creator: this.state.creator,
            color: this.state.color ? this.state.color : 'red'
        };
        let obj = {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type":"application/json"
                //"token":this.props.token if the user wants her own layers
            }
        };
        let url = "/areas?tag="+layer.tag;
        if (layer.tags.length > 0) {
            url += "&tags=" + layer.tags.join(",");
        }
        if (layer.creator) {
            url += "&creator=" + layer.creator;
        }
        fetch(url, obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((data) => {
                    layer.areas = data;
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
                          placeholder='Require tags' fluid selection multiple
                          options={tags}
                          value={this.state.tags}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Form.Field>
                <label>Require creator</label>
                <Dropdown name="creator"
                          key="creator"
                          placeholder='Require creator' fluid selection
                          options={creators}
                          value={this.state.creator}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Form.Field>
                <label>Color for the layer</label>
                <input type="text"
                       name="color"
                       value={this.state.color}
                       onChange={this.onChange}/>
              </Form.Field>
              <Button onClick={this.onSubmit}
                      name="save">Add layer</Button>
            </Form>
        );
    }
    
}
