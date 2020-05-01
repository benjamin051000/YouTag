import React from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import './App.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';


class App extends React.Component {

	constructor(props) {
		super(props);

		this.GoogleAuth = null;
		this.initClient = this.initClient.bind(this);
		this.handleAuthClick = this.handleAuthClick.bind(this);
		this.setSigninStatus = this.setSigninStatus.bind(this);
	}

	componentDidMount() {
		const googleScript = document.createElement('script');

		googleScript.src = 'https://apis.google.com/js/api.js';
		googleScript.async = true;
		googleScript.onload = () => this.handleClientLoad();

		this.instance.appendChild(googleScript);
	}

	handleClientLoad() {
		window.gapi.load('client:auth2', this.initClient);
	}

	initClient() {
		const discoveryURL = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';

		// Initialize gapi.client
		window.gapi.client.init({
			'apiKey': 'AIzaSyAW-UGcXN8-v8qbu9NpUmnsELBNs5Kp0T4',
			'clientId': '15399846948-gut7ja6158h95pesfn8il1dej16rh519.apps.googleusercontent.com',
			'discoveryDocs': [discoveryURL],
			'scope': SCOPE
		}).then(
			() => {
				this.GoogleAuth = window.gapi.auth2.getAuthInstance();

				// Listen for sign-in state changes, and update signin status.
				this.GoogleAuth.isSignedIn.listen(this.setSigninStatus);

				// Handle initial sign-in state
				// let user = this.GoogleAuth.currentUser.get(); // What is this for?
				this.setSigninStatus();
			}
		);
	} // End of initClient

	setSigninStatus() {
		let user = this.GoogleAuth.currentUser.get();
		let isAuthorized = user.hasGrantedScopes(SCOPE);

		if (isAuthorized) {
			console.log('You\'re signed in!');
			// this.setState({loggedIn: true});
		}
		else {
			console.log('You are signed out.')
		}
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
		return (
			<Router>
				<div className="App" ref={el => (this.instance = el)}>
					<Switch>
						<Route exact path="/" render={(props) => <Login {...props} handleAuthClick={this.handleAuthClick} getSubs={this.getSubs} />} />

						<Route path="/dashboard" component={Dashboard} />
					</Switch>
				</div>
			</Router>
		)
	}
}


export default App;
