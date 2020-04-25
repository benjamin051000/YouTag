import React from 'react';
import logo from './logo.svg';
import './App.css';

import { GoogleLogin } from 'react-google-login';
import { Redirect } from 'react-router-dom';


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
        };
    }

    // This has to be an arrow-syntax function in order for this.setState to work properly.
    responseGoogle = (response) => {
        console.log(response);
        console.log(response.profileObj); // This may be the important stuff in the response
        this.setState({ loggedIn: true });
    };


    render() {
        if (!this.state.loggedIn) {
            return (
                <div className="App">
                    <header className="App-header">
                        <h1>YouTag</h1>
                        <h3>A simple way to organize your content.</h3>

                        <img src={logo} className="App-logo" alt="logo" />
                        
                        <p>Sign in with your Google account to get started.</p>
                        
                        <GoogleLogin
                            clientId="15399846948-gut7ja6158h95pesfn8il1dej16rh519.apps.googleusercontent.com"
                            onSuccess={this.responseGoogle}
                        />

                        <button onClick={() => this.setState({ loggedIn: true })}>Skip login</button>
                        
                    </header>
                </div>
            );
        }
        else return <Redirect to="/dashboard" />; // This will be picked up by the router in App.js
    }
}


export default App;
