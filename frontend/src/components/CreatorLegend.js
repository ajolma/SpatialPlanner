import React from 'react';
import {Table, Message, Button} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {deleteLayer} from '../actions/creatorActions';

class CreatorLegend extends React.Component {

    deleteLayer = (e) => {
        this.props.dispatch(deleteLayer(this.props.token, e.target.id));
    }

    render() {
        let layers = this.props.layers.map((layer, index) => {
            return (
                <Table.Row key={index}>
                  <Table.Cell>{layer.tags.join(", ")}</Table.Cell>
                  <Table.Cell>{layer.color}</Table.Cell>
                  <Table.Cell>
                    <Button id={layer._id}
                            onClick={this.deleteLayer}>
                      Delete
                    </Button>
                  </Table.Cell>
                </Table.Row>
            );
        });
        return (
            <div>
              <Message>
                <Message.Header>Layers</Message.Header>
                This the list of your layers in the database.
              </Message>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>tags</Table.HeaderCell>
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
        layers: state.creator.layers,
        token: state.login.token
    };
}

export default connect(mapStateToProps)(CreatorLegend);
