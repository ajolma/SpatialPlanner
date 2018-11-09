import React from 'react';
import {Menu, Input, Button} from 'semantic-ui-react';
import {backend} from '../config';

export default class LoginForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: ""
        };
    }

    register = (user) => {
        let obj = {
            method:"POST",
            mode:"cors",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(user)
        };
        fetch(backend + "/register", obj).then((response) => { // 200-499
            if (response.ok) {
                alert("OK");
            }
            if (response.status === 409) {
                alert("Username is taken.");
            }
        }).catch((error) => { // 500-599
            console.log(error);
        });
    }

    login = (user) => {
        let obj = {
            method:"POST",
            mode:"cors",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(user)
        };
        fetch(backend + "/login", obj).then((response) => { // 200-499
            if (response.ok) {
                response.json().then((data) => {
                    this.props.login({
                        username: user.username,
                        token:data.token
                    });
                });
            } else {
                alert("Wrong username or password.");
            }
        }).catch((error) => { // 500-599
            console.log(error);
        });
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
            this.register(user);
        } else {
            this.login(user);
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
