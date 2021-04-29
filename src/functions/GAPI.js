import API_KEYS from '../api_keys.json';

// Global variable for google OAuth info
let googleAuth = null;

const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

// TODO see https://developers.google.com/youtube/v3/docs/subscriptions/list?apix=true

/**
 * Initialize Google API.
 * (equivalent of componentDidMount() in original Component class)
 */
const init_gapi = (setState) => {
    const googleScript = document.createElement('script');

    googleScript.src = 'https://apis.google.com/js/api.js';
    googleScript.async = true;
    googleScript.onload = () => window.gapi.load('client:auth2', () => {
        init_client(setState);
    });

    document.body.appendChild(googleScript);
};

/**
 * Inner function to connect to the Google API and set it up.
 * @param {function} setState 
 */
const init_client = (setState) => {
    const discoveryURL = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';
    

    // Initialize gapi.client
    window.gapi.client.init({
        'apiKey': API_KEYS.web.apiKey,
        'clientId': API_KEYS.web.client_id,
        'discoveryDocs': [discoveryURL],
        'scope': SCOPE
    }).then(
        () => {
            googleAuth = window.gapi.auth2.getAuthInstance();

            if (!googleAuth) {
                console.error('ERROR: Google API did not sign in properly.');
            }

            // Listen for sign-in state changes, and update signin status.
            googleAuth.isSignedIn.listen(() => {
                set_signin_status(setState);
            });

            // Handle initial sign-in state
            set_signin_status(setState);

            console.log("Google API initialized successfully.");
        }
    );
};

/**
 * 
 * @param {function} setState the setState function the prop uses.
 */
const set_signin_status = (setState) => {
    const user = googleAuth.currentUser.get();
    const isAuthorized = user.hasGrantedScopes(SCOPE);

    if (isAuthorized) {
        console.log('You\'re signed in!');

        // Below code from https://developers.google.com/identity/sign-in/web/sign-in
        /* Get basic information from the user's Google info */
        let profile = user.getBasicProfile();
        
        // DEBUGGING INFORMATION
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail()); // null if the 'email' scope is not present.

        setState({ isSignedIn: true, profile: profile });
    }
    else {
        console.log('You are signed out.');
        setState({ isSignedIn: false });
    }
}

const handle_login_logout = () => {
    if (googleAuth.isSignedIn.get())
        googleAuth.signOut();
    else
        googleAuth.signIn();
}

export default {
    init_gapi,
    handle_login_logout
};
