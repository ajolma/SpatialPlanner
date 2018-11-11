import React from 'react';
import {Table, Message, Button} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {removeViewerLayer} from '../actions/viewerActions';

class Legend extends React.Component {

    removeLayer = (e) => {
        let layer = this.props.layers[e.target.id];
        this.props.dispatch(removeViewerLayer(layer));
    }

    render() {
        let layers = this.props.layers.map((layer, index) => {
            layer.id = index;
            return (
                <Table.Row key={index}>
                  <Table.Cell>{layer.tag}</Table.Cell>
                  <Table.Cell>{layer.tags.join(",")}</Table.Cell>
                  <Table.Cell>{layer.creator ? layer.creator : 'any'}</Table.Cell>
                  <Table.Cell>{layer.color}</Table.Cell>
                  <Table.Cell>
                    <Button id={index}
                            onClick={this.removeLayer}>
                      Remove
                    </Button>
                  </Table.Cell>
                </Table.Row>
            );
        });
        return (
            <div>
              <Message>
                <Message.Header>Layers</Message.Header>
                This is the list of the layers that you have subscribed to.
              </Message>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>tag</Table.HeaderCell>
                    <Table.HeaderCell>add. tags</Table.HeaderCell>
                    <Table.HeaderCell>creator</Table.HeaderCell>
                    <Table.HeaderCell>color</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {layers}
                </Table.Body>
              </Table>
            </div>
        );
    }
    
}

const mapStateToProps = (state) => {
    return {
        layers: state.viewer.layers
    };
}

export default connect(mapStateToProps)(Legend);
