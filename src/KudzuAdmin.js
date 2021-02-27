import React from "react";
import {
  BrowserRouter,
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

const AUTH_PENDING = "pending";
const AUTH_AUTHENTICATED = "authenticated";
const AUTH_UNAUTHENTICATED = "unauthenticated";

class KudzuAdmin extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      baseUrl: process.env.REACT_APP_KUDZU_BASE_URL,
      authStatus: AUTH_PENDING,
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
        this.setState({authStatus: AUTH_AUTHENTICATED})
        return;
      }
      this.setState({authStatus: AUTH_UNAUTHENTICATED})
    })
    .catch(error => {
      console.error(error)
      this.setState({authStatus: AUTH_UNAUTHENTICATED})
    })
  }

  render() {
    return (
      <Page>
      <KudzuToolbar authStatus={this.state.authStatus} />
      <KudzuRouter
        baseUrl={this.state.baseUrl}
        authStatus={this.state.authStatus}
      />
      </Page>
    );
  }
}

function KudzuToolbar({authStatus}) {
  return (
    <AppBar position="static">
    <Toolbar variant="dense">
      { authStatus === AUTH_UNAUTHENTICATED &&
        <Button key="login" href="/login">Login</Button>
      }
      { authStatus === AUTH_AUTHENTICATED &&
        <>
        <Button key="admin:content" href="/admin/content">Content</Button>
        <Button key="admin:users" href="/admin/users">Users</Button>
        </>
      }
    </Toolbar>
  </AppBar>
  )
}

function KudzuRouter({baseUrl, authStatus}) {
  return (
    <BrowserRouter>
    <Switch>
      <Route path="/login" exact={true}>
        { authStatus === AUTH_UNAUTHENTICATED &&
          <Login baseUrl={baseUrl} />
        }
        { authStatus === AUTH_AUTHENTICATED &&
          <Redirect to="/admin/content" />
        }
      </Route>
      <Route path="/admin/users" exact={true}>
        { authStatus === AUTH_AUTHENTICATED ?
          <Users /> : <NoMatch authStatus={authStatus} />
        }
      </Route>
      <Route path="/admin/content" exact={true}>
        { authStatus === AUTH_AUTHENTICATED ?
            <Content /> : <NoMatch authStatus={authStatus} />
        }
      </Route>
      <Route path="*">
        <NoMatch authStatus={authStatus}/>
      </Route>
    </Switch>
  </BrowserRouter>
  )
}

export {
  KudzuAdmin,
  AUTH_PENDING,
  AUTH_AUTHENTICATED,
  AUTH_UNAUTHENTICATED
}
