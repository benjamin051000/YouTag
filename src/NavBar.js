import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';
import NavItem from 'react-bootstrap/NavItem';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, useLocation } from 'react-router-dom';

function NavBar(props) {
    const {pathname} = useLocation();
    
    const profile = props.profile;
    const profilePic = profile.getImageUrl();
    const user_name = profile.getName();

    return (
        <Navbar>
            <Navbar.Brand>YouTag</Navbar.Brand>
            <Nav className="container-fluid">

                <Nav.Item className="ml-auto">
                    <Dropdown alignRight>
                        <Dropdown.Toggle as={Nav.Link}>
                            <Image src={profilePic} roundedCircle fluid alt="Google Profile Pic" width="40" height="40"/>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Header>Signed in as {user_name}</Dropdown.Header>
                            <Dropdown.Item onClick={props.handleAuthClick} variant="danger">Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>                 
                </Nav.Item>

                {pathname.startsWith('/dashboard/') &&
                    <Link to='/dashboard'>
                        Back to Topics
                    </Link>
                }
            </Nav>
        </Navbar>
    );
}

export default NavBar;