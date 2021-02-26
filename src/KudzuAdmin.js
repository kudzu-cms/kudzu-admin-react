import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Content from "./admin/content";
import Login from "./admin/login";
import Users from "./admin/users";


function KudzuAdmin() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/admin/login">Login</Link>
            </li>
            <li>
              <Link to="/admin/content">Content</Link>
            </li>
            <li>
              <Link to="/admin/users">Users</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/admin/login">
            <Login baseUrl="http://localhost:8080" />
          </Route>
          <Route path="/admin/users">
            <Users />
          </Route>
          <Route path="/admin/content">
            <Content />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

export default KudzuAdmin;
