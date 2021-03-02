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

const KUDZU_BASE_URL = process.env.REACT_APP_KUDZU_BASE_URL;
const KUDZU_AUTH_PENDING = "pending";
const KUDZU_AUTH_AUTHENTICATED = "authenticated";
const KUDZU_AUTH_UNAUTHENTICATED = "unauthenticated";

class KudzuAdmin extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      authStatus: KUDZU_AUTH_PENDING,
    };
  }

  componentDidMount() {
    this.checkIsAuthenticated();
  }

  checkIsAuthenticated(successCallback) {
    axios.get(`${KUDZU_BASE_URL}/admin/login`, {
      withCredentials: true,
    })
    .then(response => {
      console.log(response)
      if (response.data.success === true) {
        this.setState({authStatus: KUDZU_AUTH_AUTHENTICATED})
        return;
      }
      this.setState({authStatus: KUDZU_AUTH_UNAUTHENTICATED})
    })
    .catch(error => {
      console.error(error)
      this.setState({authStatus: KUDZU_AUTH_UNAUTHENTICATED})
    })
  }

  render() {
    return (
      <Page>
      <KudzuToolbar authStatus={this.state.authStatus} />
      <div style={{margin: "0 1em"}}>
      <KudzuRouter
        contentTypes={this.state.contentTypes}
        authStatus={this.state.authStatus}
      />
      </div>
      </Page>
    );
  }
}

function KudzuToolbar({authStatus}) {
  return (
    <AppBar position="static">
    <Toolbar variant="dense">
      { authStatus === KUDZU_AUTH_UNAUTHENTICATED &&
        <Button key="login" href="/login">Login</Button>
      }
      { authStatus === KUDZU_AUTH_AUTHENTICATED &&
        <>
        <Button key="admin:content" href="/admin/content">Content</Button>
        <Button key="admin:users" href="/admin/users">Users</Button>
        </>
      }
    </Toolbar>
  </AppBar>
  )
}

function KudzuRouter({authStatus, contentTypes}) {
  return (
    <BrowserRouter>
    <Switch>
      <Route path="/login" exact={true}>
        { authStatus === KUDZU_AUTH_UNAUTHENTICATED &&
          <Login />
        }
        { authStatus === KUDZU_AUTH_AUTHENTICATED &&
          <Redirect to="/admin/content" />
        }
      </Route>
      <Route path="/admin/users" exact={true}>
        { authStatus === KUDZU_AUTH_AUTHENTICATED ?
          <Users /> : <NoMatch authStatus={authStatus} />
        }
      </Route>
      <Route path="/admin/content" exact={true}>
        { authStatus === KUDZU_AUTH_AUTHENTICATED ?
            <Content contentTypes={contentTypes} /> : <NoMatch authStatus={authStatus} />
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
  KUDZU_BASE_URL,
  KUDZU_AUTH_PENDING,
  KUDZU_AUTH_AUTHENTICATED,
  KUDZU_AUTH_UNAUTHENTICATED
}
