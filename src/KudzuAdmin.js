import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import axios from "axios";

import Content from "./admin/content";
import Login from "./admin/login";
import Users from "./admin/users";
import NoMatch from "./misc/no-match";
import Page from "./layout/page";
import { AppBar, Button, Toolbar } from "@material-ui/core";

class KudzuAdmin extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      baseUrl: process.env.REACT_APP_KUDZU_BASE_URL,
      isAuthenticated: false,
    };
  }

  componentDidMount() {
    this.checkIsAuthenticated();
  }

  checkIsAuthenticated() {
    axios.get(`${this.state.baseUrl}/admin/login`, {
      withCredentials: true,
    })
    .then(response => {
      console.log(response)
      if (response.data.success === true) {
        this.setState({isAuthenticated: true})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }

  render() {
    return (
      <Page>
      <Router>
        <AppBar position="static">
          <Toolbar variant="dense">
            { !this.state.isAuthenticated &&
              <Button key="login" href="/login">Login</Button>
            }
            { this.state.isAuthenticated &&
              <>
              <Button key="admin:content" href="/admin/content">Content</Button>
              <Button key="admin:users" href="/admin/users">Users</Button>
              </>
            }
          </Toolbar>
        </AppBar>
        <Switch>
          <Route path="/login">
            { !this.state.isAuthenticated &&
              <Login baseUrl={this.state.baseUrl} />
            }
            { this.state.isAuthenticated &&
              <Redirect to="/admin/content" />
            }
          </Route>
          { this.state.isAuthenticated &&
            <>
            <Route path="/admin/users">
              <Users />
            </Route>
            <Route path="/admin/content">
              <Content />
            </Route>
            </>
          }
          <Route path="*">
            <NoMatch/>
          </Route>
        </Switch>
      </Router>
      </Page>
    );
  }
}


export default KudzuAdmin;
