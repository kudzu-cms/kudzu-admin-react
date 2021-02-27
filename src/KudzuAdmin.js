import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import axios from "axios";

import Content from "./admin/content";
import Login from "./admin/login";
import Users from "./admin/users";
import NoMatch from "./misc/no-match";
import Page from "./layout/page";

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
        <div>
          <nav>
            <ul>
            { !this.state.isAuthenticated &&
              <li>
                <Link key="login" to="/login">Login</Link>
              </li>
            }
            { this.state.isAuthenticated &&
              <>
              <li>
                <Link key="admin:content" to="/admin/content">Content</Link>
              </li>
              <li>
                <Link key="admin:users" to="/admin/users">Users</Link>
              </li>
              </>
            }
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
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
        </div>
      </Router>
      </Page>
    );
  }
}


export default KudzuAdmin;
