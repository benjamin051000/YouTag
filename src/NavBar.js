import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

function NavBar(props) {
    return (
        <Navbar>
            <Navbar.Brand>YouTag</Navbar.Brand>
            <Button variant="outline-danger" size="sm" onClick={props.handleAuthClick}>Logout</Button>

            <Link to='/dashboard'>
                <Button size="sm">Back to Topics</Button>
            </Link>
        </Navbar>
    );
}

export default NavBar;