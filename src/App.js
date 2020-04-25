import React from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/dashboard" component={Dashboard} />
        </Switch>
      </div>
    </Router>
  )
}


export default App;
