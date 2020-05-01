import React from 'react';
import logo from './logo.svg';

import { Redirect } from 'react-router-dom';


class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = { loggedIn: false };
    }

    render() {
        if (!this.state.loggedIn) {
            return (
                <div className="App" ref={el => (this.instance = el)}> {/* ref tag allows for the script to be added */}
                    <header className="App-header">
                        <h1>YouTag</h1>
                        <h3>A simple way to organize your content.</h3>

                        <img src={logo} className="App-logo" alt="logo" />

                        <p>Sign in with your Google account to get started.</p>

                        <button onClick={this.props.handleAuthClick}>Sign in with Google</button>

                        <br/>

                        {/* TODO see https://developers.google.com/identity/branding-guidelines for CSS guidelines */}

                        <button onClick={() => this.setState({ loggedIn: true })}>Dashboard</button>
                    </header>
                </div>
            );
        }
        else return <Redirect to="/dashboard" />; // This will be picked up by the router in App.js
    }
}


export default Login;
