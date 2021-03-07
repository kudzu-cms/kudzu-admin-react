import React from "react"
import axios from "axios";
import qs from 'qs'

import { Button, TextField } from "@material-ui/core";
import { Alert } from '@material-ui/lab';
import { KUDZU_BASE_URL } from "../../KudzuAdmin";

class  Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {messages: []}
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = {
      email: event.target.email.value,
      password: event.target.password.value
    };
    this.setState({messages: []});
    axios.post(`${KUDZU_BASE_URL}/api/user/login`, qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      withCredentials: true,
    })
    .then((response) => {
      this.setState({messages: []});
      if (response.data.success === true) {
        window.location = "/admin/content";
      }
    })
    .catch((error) => {
      let messages = this.state.messages;
      messages.push('Login failed.')
      this.setState({messages: messages});
    });

  }

  render() {
    return (
      <div style={{maxWidth: "960px", margin: "0 auto"}}>
      <h1>Login</h1>
      { this.state.messages.map(message => {
          return <Alert severity="error" style={{marginBottom: "5px"}}>{ message }</Alert>
        })
      }
      <form onSubmit={this.handleSubmit}>

        <div style={{marginBottom: '10px'}}>
          <TextField fullWidth label="Email address" placeholder="Enter your email address e.g. you@example.com" type="email" name="email" required={true} />
        </div>

        <div style={{marginBottom: '10px'}}>
          <TextField fullWidth label="password" placeholder="Enter your password" type="password" name="password" required={true} />
        </div>

        <div>
          <Button type='submit' variant='contained' size='large' color='primary' style={{marginRight: '5px'}}>
            Log in
          </Button>
          <Button href={`${KUDZU_BASE_URL}/admin/recover`} variant='contained' size='large'>
            Forgot password?
          </Button>
        </div>
      </form>
      </div>
    )
  }
}

export default Login
