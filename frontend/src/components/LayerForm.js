import React from 'react';
import {Form, Button} from 'semantic-ui-react';

export default class LayerForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tags: ["tag1", "tag2"]
        };
    }

    newTags = (e) => {
        console.log(e.target);
        this.setState({
            tags: e.target.value.split(", ")
        });
    }

    onSave = (event) => {
        event.preventDefault();
        this.props.endEdit();
        let layer = {
            tags: this.state.tags,
            geometries: []
        };
        for (let i = 0; i < this.props.polygons.length; i++) {
            layer.geometries.push({
                type: "Polygon",
                coordinates: [this.props.polygons[i]]
            });
        }
        let obj = {
            method:"POST",
            mode:"cors",
            headers:{
                "Content-Type":"application/json",
                "token":this.props.token
            },
            body:JSON.stringify(layer)
        };
        fetch("/api/layers", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((data) => {
                    this.props.newLayer(layer);
                });
            } else {
                response.json().then((data) => {
                    alert("Server responded: "+data.message);
                });
            }
        }).catch((error) => { // 500-599
            console.log(error);
        });
    }
    
    render() {
        return (
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
              </Form.Field>
            </Form.Group>
        );
    }

}
