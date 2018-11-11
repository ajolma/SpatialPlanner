import React from 'react';
import {Menu, Input, Button} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {onRegister, onLogin} from '../actions/loginActions.js';

class LoginForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: ""
        };
    }

    onChange = (event) => {
        let o = {};
        o[event.target.name] = event.target.value;
        this.setState(o);
    }

    onSubmit = (event) => {
        event.preventDefault();
        let user = {
            username:this.state.username,
            password:this.state.password
        };
        if (event.target.name === "register") {
            this.props.dispatch(onRegister(user));
        } else {
            this.props.dispatch(onLogin(user));
        }
        this.setState({
            username:"",
            password:""
        });
    }
    
    render() {
        return (
            <Menu.Menu position='right'>
              <Menu.Item>
                <Input type="text"
                       placeholder="username"
                       name="username"
                       value={this.state.username}
                       onChange={this.onChange}/>
              </Menu.Item>
              <Menu.Item>
                <Input type="password"
                       placeholder="password"
                       name="password"
                       value={this.state.password}
                       onChange={this.onChange}/>
              </Menu.Item>
              <Menu.Item>
                <Button onClick={this.onSubmit}
                        name="register">register</Button>
              </Menu.Item>
              <Menu.Item>
                <Button onClick={this.onSubmit}
                        name="login">login</Button>
              </Menu.Item>
            </Menu.Menu>
        );
    }
    
}

export default connect()(LoginForm);
