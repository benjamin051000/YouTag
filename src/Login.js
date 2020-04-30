import React from 'react';
import logo from './logo.svg';
import './App.css';

// import { GoogleLogin } from 'react-google-login';
import { Redirect } from 'react-router-dom';


const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = { loggedIn: false };

        this.GoogleAuth = null;

        // this.initClient = this.initClient.bind(this);
        this.handleClientLoad = this.handleClientLoad.bind(this);
        this.initClient = this.initClient.bind(this);
        this.finishInit = this.finishInit.bind(this);
        this.handleAuthClick = this.handleAuthClick.bind(this);
        this.updateSigninStatus = this.updateSigninStatus.bind(this);
    }


    componentDidMount() {
        const googleScript = document.createElement('script');

        googleScript.src = 'https://apis.google.com/js/api.js';
        googleScript.async = true; // TODO is this necessary?

        this.instance.appendChild(googleScript);
    }


    handleClientLoad() {
        window.gapi.load('client:auth2', this.initClient);
    }


    initClient() {
        let discoveryURL = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';

        // Initialize gapi.client
        window.gapi.client.init({
            'apiKey': 'AIzaSyAW-UGcXN8-v8qbu9NpUmnsELBNs5Kp0T4',
            'clientId': '15399846948-gut7ja6158h95pesfn8il1dej16rh519.apps.googleusercontent.com',
            'discoveryDocs': [discoveryURL],
            'scope': SCOPE
        }).then(this.finishInit);
    } // End of initClient


    finishInit() {
        this.GoogleAuth = window.gapi.auth2.getAuthInstance();

        // Listen for sign-in state changes.
        this.GoogleAuth.isSignedIn.listen(this.updateSigninStatus);

        // Handle initial sign-in state
        let user = this.GoogleAuth.currentUser.get(); // What user is this?
        this.setSigninStatus();
    }

    setSigninStatus() {
        let user = this.GoogleAuth.currentUser.get();
        let isAuthorized = user.hasGrantedScopes(SCOPE);

        if (isAuthorized) {
            console.log('You\'re signed in!');
            // this.setState({loggedIn: true});
        }
        else {
            console.log('You are not signed in.')
        }
    }


    updateSigninStatus() {
        this.setSigninStatus();
    }


    handleAuthClick() {
        if (this.GoogleAuth.isSignedIn.get()) {
            this.GoogleAuth.signOut();
        }
        else {
            this.GoogleAuth.signIn();
        }
    }

    getSubs() {
        window.gapi.client.youtube.subscriptions.list({
            'part': 'snippet',
            // 'maxResults': 50,  // Ensure this works if user has <50 subs
            'mine': true
        })
            .then(function (response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
            },
                function (err) { console.error("Execute error", err); });
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


                        <button onClick={this.handleClientLoad}>Init auth</button>

                        <br />

                        <button onClick={this.handleAuthClick}>Sign in with Google</button>

                        <br />
                        {/* <button onClick={() => this.setState({ loggedIn: true })}>Skip login</button> */}
                        {/* <br/> */}

                        <button onClick={this.getSubs}>Fetch subscriptions</button>

                    </header>
                </div>
            );
        }
        else return <Redirect to="/dashboard" />; // This will be picked up by the router in App.js
    }
}


export default App;
