import React from 'react';
import {Message, Form, Button, Dropdown} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {colors} from '../actions/creatorActions';
import {addLayer} from '../actions/viewerActions';

class SearchTool extends React.Component {

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

    colorList = []

    onSubmit = (event) => {
        event.preventDefault();
        let layer = {
            tag: this.state.tag,
            tags: this.state.tags,
            color: this.state.color ? this.state.color : this.colorList[0].value,
            geometries: [],
            creator: this.state.creator
        };
        this.props.dispatch(addLayer(layer));
    }

    render() {
        let tags = this.props.tags.map(
            (tag, i) => {return {key: i, text: tag, value: tag};});
        let creators = this.props.creators.map(
            (creator, i) => {return {key: i, text: creator, value: creator};});
        creators.unshift({key: -1, text: '', value: ''});
        this.colorList = [];
        for (let i = 0; i < colors.length; i++) {
            let color = colors[i];
            let used = false;
            for (let j = 0; j < this.props.layers.length; j++) {
                if (this.props.layers[j].color === color) {
                    used = true;
                    break;
                }
            }
            if (!used) {
                this.colorList.push({key: i, text: color, value: color});
            }
        }
        return (
            <Form>
              <Message>
                <Message.Header>Add and subscribe to a layer</Message.Header>
                This is the tool to add and subscribe to layers.
              </Message>
              <Form.Field>
                <label>Tag</label>
                <Dropdown name="tag"
                          placeholder='Tag' fluid search selection
                          options={tags}
                          value={this.state.tag}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Form.Field>
                <label>Require additional tags</label>
                <Dropdown name="tags"
                          key="tags"
                          placeholder='Tags' fluid search selection multiple
                          options={tags}
                          value={this.state.tags}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Form.Field>
                <label>Require creator</label>
                <Dropdown name="creator"
                          key="creator"
                          placeholder='Creator' fluid search selection
                          options={creators}
                          value={this.state.creator}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Form.Field>
                <label>Color for the layer</label>
                <Dropdown name="color"
                          key="color"
                          placeholder='Layer color' fluid search selection
                          options={this.colorList}
                          value={this.state.color}
                          onChange={this.onChange2}/>
              </Form.Field>
              <Button onClick={this.onSubmit}
                      name="save">Add/Subscribe</Button>
            </Form>
        );
    }
    
}

const mapStateToProps = (state) => {
    return {
        tags: state.viewer.tags,
        creators: state.viewer.creators,
        layers: state.viewer.layers
    };
}

export default connect(mapStateToProps)(SearchTool);
