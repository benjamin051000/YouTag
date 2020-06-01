import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';

function NavBar(props) {
    return  (
        <Navbar>
            <Navbar.Brand>YouTag</Navbar.Brand>
            <Button variant="outline-danger" size="sm" onClick={props.handleAuthClick} disabled={!props.isSignedIn}>Logout</Button>
        </Navbar>
    );
}

export default NavBar;