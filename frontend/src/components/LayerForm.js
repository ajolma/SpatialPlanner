import React from 'react';
import {Form, Message, Label, Dropdown, Input, Button} from 'semantic-ui-react';

export default class LayerForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedTags: [],
            newTags: ""
        };
    }

    onSave = (event) => {
        event.preventDefault();
        this.props.endEdit();
        let tags = [];
        let newTags = this.state.newTags.split(",");
        for (let i = 0; i < newTags.length; i++) {
            let tag = newTags[i];
            tag = tag.replace(/^\s+/, '');
            tag = tag.replace(/\s+$/, '');
            if (tag !== '') {
                tags.push(tag);
            }
        }
        for (let i = 0; i < this.state.selectedTags.length; i++) {
            let tag = this.state.selectedTags[i];
            if (tags.indexOf(tag) === -1 && tag !== '') {
                tags.push(tag);
            }
        }
        console.log("save layer, tags count = "+tags.length);
        let layer = {
            tags: tags,
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

    onChangeOfSelectedTags = (event, data) => {
        this.setState({
            selectedTags: data.value
        });
    }
    
    onChangeOfNewTags = (e) => {
        this.setState({
            newTags: e.target.value
        });
    }

    render() {
        let tags = this.props.tags.map(
            (tag, i) => {return {key: i, text: tag, value: tag};});
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
                  <Dropdown name="selectedTags"
                            key="selectedTags"
                            placeholder='Tags' fluid search selection multiple
                            options={tags}
                            value={this.state.selectedTags}
                            onChange={this.onChangeOfSelectedTags}/>
                </Form.Field>
              </Form.Group>
              <Form.Group>
                <Form.Field>
                  <Label>New tags:</Label>
                </Form.Field>
                <Form.Field>
                  <Input type="text"
                         name="newTags"
                         placeholder="newTag1, newTag2, ..."
                         value={this.state.newTags}
                         onChange={this.onChangeOfNewTags}/>
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
