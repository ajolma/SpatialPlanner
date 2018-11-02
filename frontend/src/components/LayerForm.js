import React from 'react';
import {Form, Message, Label, Input, Button} from 'semantic-ui-react';

export default class LayerForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tags: []
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
            <Form>
              <Form.Field>
                <Message>
                  <Message.Header>Layer creation tool</Message.Header>
                  <p>
                    Add polygons using map drawing tools, add tags separated by comma and space and then save.
                  </p>
                </Message>
              </Form.Field>
              <Form.Group>
                <Form.Field>
                  <Label>Tags:</Label>
                </Form.Field>
                <Form.Field>
                  <Input type="text"
                         name="tags"
                         placeholder="tag1, tag2, ..."
                         value={this.state.tags.join(", ")}
                         onChange={this.newTags}/>
                </Form.Field>
              </Form.Group>
              <Form.Field>
                <Button onClick={this.onSave}
                        name="save">Save
                </Button>
              </Form.Field>
            </Form>
        );
    }

}
