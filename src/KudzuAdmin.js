import React from "react";
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import axios from "axios";

import Content from "./admin/content";
import Login from "./admin/login";
import Users from "./admin/users";
import NoMatch from "./misc/no-match";
import Page from "./layout/page";
import { AppBar, Button, Grid, Toolbar } from "@material-ui/core";
import Init from "./admin/init";

const KUDZU_BASE_URL = process.env.REACT_APP_KUDZU_BASE_URL;
const KUDZU_AUTH_PENDING = "pending";
const KUDZU_AUTH_AUTHENTICATED = "authenticated";
const KUDZU_AUTH_UNAUTHENTICATED = "unauthenticated";

const KUDZU_INIT_PENDING = "pending"
const KUDZU_INIT_COMPLETE = "complete"
const KUDZU_INIT_INCOMPLETE = "incomplete"

class KudzuAdmin extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      authStatus: KUDZU_AUTH_PENDING,
      initStatus: KUDZU_INIT_PENDING
    };
  }

  componentDidMount() {
    this.checkIsAuthenticated();
  }

  checkIsAuthenticated() {
    axios.get(`${KUDZU_BASE_URL}/api/user/login`, {
      withCredentials: true,
    })
    .then(response => {
      console.log(response)
      if (response.status === 200) {
        this.setState({initStatus: KUDZU_INIT_COMPLETE})
        if (response.data.success === true) {
          this.setState({authStatus: KUDZU_AUTH_AUTHENTICATED})
          return;
        }
        this.setState({authStatus: KUDZU_AUTH_UNAUTHENTICATED})
      }
    })
    .catch(error => {
      console.error(error.response)
      this.setState({
        authStatus: KUDZU_AUTH_UNAUTHENTICATED,
        // 401 indicates the system is ready but the user is unauthenticated.
        initStatus: error.response.status === 401 ? KUDZU_INIT_COMPLETE : KUDZU_INIT_INCOMPLETE,
      })
    })
  }

  render() {
    return (
      <Page>
      <KudzuToolbar
        authStatus={this.state.authStatus}
        initStatus={this.state.initStatus}
        />
      <div style={{margin: "0 1em"}}>
      <KudzuRouter
        contentTypes={this.state.contentTypes}
        authStatus={this.state.authStatus}
        initStatus={this.state.initStatus}
      />
      </div>
      </Page>
    );
  }
}

function KudzuToolbar({authStatus, initStatus}) {
  return (
    <AppBar position="static">
    <Toolbar variant="dense">
    <Grid container spacing={3}>
      <Grid item xs={11}>
        { authStatus === KUDZU_AUTH_AUTHENTICATED &&
          <>
          <Button key="admin:content" href="/admin/content">Content</Button>
          <Button key="admin:users" href="/admin/users">Users</Button>
          </>
        }
      </Grid>
      <Grid item xs={1}>
        { initStatus === KUDZU_INIT_COMPLETE && authStatus === KUDZU_AUTH_UNAUTHENTICATED &&
          <Button key="admin:login" href="/login">Login</Button>
        }
        { authStatus === KUDZU_AUTH_AUTHENTICATED &&
          <Button key="admin:logout" onClick={handleLogout}>Logout</Button>
        }
      </Grid>
    </Grid>
    </Toolbar>
  </AppBar>
  )
}

function KudzuRouter({authStatus, initStatus, contentTypes}) {
  console.log(initStatus)
  return (
    <BrowserRouter>
    <Switch>
      <Route path="/" exact={true}>
        {
          initStatus === KUDZU_INIT_INCOMPLETE ? <Redirect to="/init" /> : <Redirect to="/login" />
        }
      </Route>
      <Route path="/init" exact={true}>
        {
          initStatus === KUDZU_INIT_INCOMPLETE ? <Init /> : <Redirect to="/" />
        }
      </Route>
      <Route path="/login" exact={true}>
        {
          initStatus === KUDZU_INIT_INCOMPLETE && <Redirect to="/init" />
        }
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
      <Route path="/admin/content">
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

function handleLogout(event) {
  event.preventDefault();
  axios.post(`${KUDZU_BASE_URL}/api/user/logout`, {}, {
    withCredentials: true,
  })
  .then((response) => {
    console.log(response);
    if (response.status === 200) {
      window.location = '/';
    }
  })
  .catch((error) => {
    console.log(error)
  });
}

export {
  KudzuAdmin,
  KUDZU_BASE_URL,
  KUDZU_AUTH_PENDING,
  KUDZU_AUTH_AUTHENTICATED,
  KUDZU_AUTH_UNAUTHENTICATED
}
