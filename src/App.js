import React from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import './App.css';
import API_KEYS from './api_keys.json';

import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';


class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {isSignedIn: false};

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
			'apiKey': API_KEYS.apiKey,
			'clientId': API_KEYS.clientId,
			'discoveryDocs': [discoveryURL],
			'scope': SCOPE
		}).then(
			() => {
				this.GoogleAuth = window.gapi.auth2.getAuthInstance();

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
			this.setState({isSignedIn: true});
		}
		else {
			console.log('You are signed out.');
			this.setState({isSignedIn: false});
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

	render() {
		return (
			<Router>
				<div className="App" ref={el => (this.instance = el)}>
					<Switch>
						<Route exact path="/" render={(props) => <Login {...props} handleAuthClick={this.handleAuthClick}/>} />

						<Route path="/dashboard" render={(props) => <Dashboard {...props} handleAuthClick={this.handleAuthClick}/>} />
					</Switch>

					{
						this.state.isSignedIn && <Redirect to='/dashboard'/>
					}
					{
						!this.state.isSignedIn && <Redirect to='/' />
					}
				</div>
			</Router>
		)
	}
}


export default App;
