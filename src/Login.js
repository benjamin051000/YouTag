import React from 'react';
import logo from './logo.svg';
import Button from 'react-bootstrap/Button';

function Login(props) {
    return (
        <div className="App">
            <header className="App-header">
                <h1>YouTag</h1>
                <h3>A simple way to organize your content.</h3>

                <img src={logo} className="App-logo" alt="logo" />

                <p>Sign in with your Google account to get started.</p>

                <Button variant="primary" onClick={props.handleAuthClick}>Sign in with Google</Button>

                {/* TODO see https://developers.google.com/identity/branding-guidelines for CSS guidelines */}

            </header>
        </div>
    );
}


export default Login;
