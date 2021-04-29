import React, { useState, useEffect } from 'react';
import Login from './Login.js';
import Dashboard from './Dashboard.js';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import GAPI from './GAPI.js';

export default function App() {
    const [state, setState] = useState({
        isSignedIn: false,
        profile: null
    });

    // Initialize GAPI on render.
    useEffect(() => {
        GAPI.init_gapi(setState);
    }, []);

    // console.log('Rendering newapp...');
    // console.log(`state.isSignedin=${state.isSignedIn}`);

    return (
        <Router>
            <div className="App"> {/* TODO this had a rel attr in original class */}
                <Switch>
                    <Route exact path="/" render={props => <Login {...props} handleAuthClick={GAPI.handle_login_logout}/>}/>
                    <Route path="/dashboard" render={props => <Dashboard {...props} profile={state.profile} handleAuthClick={GAPI.handle_login_logout}/>}/>
                </Switch>

                {state.isSignedIn && <Redirect to='/dashboard'/>}
                {!state.isSignedIn && <Redirect to='/' />}
            </div>
        </Router>
    );
}
