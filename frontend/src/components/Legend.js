import React from 'react';
import {Table, Message, Button} from 'semantic-ui-react';

export default class Legend extends React.Component {

    removeLayer = (e) => {
        console.log("remove layer " + e.target.id);
        let browsing = this.props.mode === "Browse";
        if (browsing) {
            this.props.removeLayer(e.target.id);
        } else {
            this.props.deleteLayer(e.target.id);
        }
    }

    render() {
        console.log("render legend");
        let browsing = this.props.mode === "Browse";
        let action = browsing ? "Remove" : "Delete";
        for (let i = 0; i < this.props.layers.length; i++) {
            console.log(i+"  "+JSON.stringify(this.props.layers[i]));
        }
        let layers = this.props.layers.filter(function(layer) {
            if (browsing && layer.saved) {
                return false;
            }
            return true;
        }).map((layer, index) => {
            console.log(layer);
            return (
                <Table.Row key={index}>
                  <Table.Cell>{layer.tag}</Table.Cell>
                  <Table.Cell>{layer.tags.join(",")}</Table.Cell>
                  <Table.Cell>{layer.creator}</Table.Cell>
                  <Table.Cell>{layer.color}</Table.Cell>
                  <Table.Cell>
                    <Button id={index}
                            onClick={this.removeLayer}>
                      {action}
                    </Button>
                  </Table.Cell>
                </Table.Row>
            );
        });
        return (
            <div>
              <Message>
                <Message.Header>Layers</Message.Header>
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
