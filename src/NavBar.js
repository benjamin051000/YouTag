import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Link, useLocation } from 'react-router-dom';

function NavBar(props) {
    const {pathname} = useLocation();

    return (
        <Navbar>
            <Navbar.Brand>YouTag</Navbar.Brand>

            <Button variant="outline-danger" size="sm" onClick={props.handleAuthClick}>Logout</Button>

            {pathname.startsWith('/dashboard/') &&
                <Link to='/dashboard'>
                    Back to Topics
                </Link>
            }
        </Navbar>
    );
}

export default NavBar;