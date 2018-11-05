import React from 'react';
import {Table, Message, Button} from 'semantic-ui-react';

export default class Legend extends React.Component {

    removeLayer = (e) => {
        this.props.removeLayer(e.target.id);
    }

    render() {
        let layers = this.props.layers.map((layer, index) => {
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