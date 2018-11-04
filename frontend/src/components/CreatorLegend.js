import React from 'react';
import {Table, Message, Button} from 'semantic-ui-react';

export default class CreatorLegend extends React.Component {

    deleteLayer = (e) => {
        let id = e.target.id;
        console.log("delete layer "+id);
        let obj = {
            method: "DELETE",
            mode: "cors",
            headers: {
                "Content-Type":"application/json",
                token: this.props.token
            }
        };
        fetch("/api/layers/" + id, obj).then((response) => { // 200-499
            if (response.ok) {
                this.props.deleteLayer(id);
            } else {
                console.log("Server responded with status: "+response.status);
            }
        }).catch((error) => { // 500-599
            console.log(error);
        });
        this.props.deleteLayer(id);
    }

    render() {
        let layers = this.props.layers.map((layer, index) => {
            return (
                <Table.Row key={index}>
                  <Table.Cell>{layer.tags.join(",")}</Table.Cell>
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
                This the the list of your layers in the database.
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
