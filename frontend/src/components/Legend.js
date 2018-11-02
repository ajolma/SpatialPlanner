import React from 'react';
import {Table, Button} from 'semantic-ui-react';

export default class Legend extends React.Component {

    render() {
        console.log("render legend");
        for (let i = 0; i < this.props.layers.length; i++) {
            console.log(i+"  "+JSON.stringify(this.props.layers[i]));
        }
        let layers = this.props.layers.map((item, index) => {
            console.log(item);
            return (
                <Table.Row key={index}>
                  <Table.Cell>{item.tag}</Table.Cell>
                  <Table.Cell>{item.tags.join(",")}</Table.Cell>
                  <Table.Cell>{item.user ? item.user : "any"}</Table.Cell>
                  <Table.Cell>{item.color}</Table.Cell>
                  <Table.Cell><Button id={item._id}
                                      onClick={this.removeItem}>Remove</Button>
                  </Table.Cell>
                </Table.Row>
            );
        });
        return (
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
        );
    }
    
}
