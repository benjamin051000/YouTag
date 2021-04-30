import React from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import API_KEYS from './api_keys.json';

import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

// TODO replace with React function
class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isSignedIn: false,
			profile: null
		};

		this.GoogleAuth = null;
		this.initClient = this.initClient.bind(this);
		this.handleAuthClick = this.handleAuthClick.bind(this);
		this.setSigninStatus = this.setSigninStatus.bind(this);
	}

	componentDidMount() {
		const googleScript = document.createElement('script');

		googleScript.src = 'https://apis.google.com/js/api.js';
		googleScript.async = true;
		googleScript.onload = () => window.gapi.load('client:auth2', this.initClient);

		this.instance.appendChild(googleScript);
	}

	initClient() {
		const discoveryURL = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';

		// Initialize gapi.client
		window.gapi.client.init({
			'apiKey': API_KEYS.web.apiKey,
			'clientId': API_KEYS.web.client_id,
			'discoveryDocs': [discoveryURL],
			'scope': SCOPE
		}).then(
			() => {
				this.GoogleAuth = window.gapi.auth2.getAuthInstance();

				if(!this.GoogleAuth) {
					console.error('ERROR: Google API did not sign in properly.');
				}

				// Listen for sign-in state changes, and update signin status.
				this.GoogleAuth.isSignedIn.listen(this.setSigninStatus);

				// Handle initial sign-in state
				this.setSigninStatus();
			}
		);
	} // End of initClient

	setSigninStatus() {
		let user = this.GoogleAuth.currentUser.get();
		let isAuthorized = user.hasGrantedScopes(SCOPE);

		if (isAuthorized) {
			console.log('You\'re signed in!');

			// https://developers.google.com/identity/sign-in/web/sign-in
			
			/* Get basic information from the user's Google info */
			let profile = user.getBasicProfile();
			
			console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
			console.log('Name: ' + profile.getName());
			console.log('Image URL: ' + profile.getImageUrl());
			console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

			this.setState({isSignedIn: true, profile: profile});
		}
		else {
			console.log('You are signed out.');
			this.setState({isSignedIn: false});
		}
	}

	handleAuthClick() {
		if(!this.GoogleAuth) {
			alert("ERROR: Google API did not sign in properly.");
			return;
		}
		if (this.GoogleAuth.isSignedIn.get()) {
			this.GoogleAuth.signOut();
		}
		else {
			this.GoogleAuth.signIn();
		}
	}

	render() {
		return (
			<Router>
				
				<div className="App" ref={el => (this.instance = el)}>
					<Switch>
						<Route exact path="/" render={(props) => 
							<Login {...props} handleAuthClick={this.handleAuthClick}/>
						} />

						<Route path="/dashboard" render={(props) => 
							<Dashboard {...props} handleAuthClick={this.handleAuthClick} profile={this.state.profile}/>
						} />

					</Switch>

					{this.state.isSignedIn && <Redirect to='/dashboard'/>}
					{!this.state.isSignedIn && <Redirect to='/' />}
				</div>
			</Router>
		)
	}
}


export default App;
