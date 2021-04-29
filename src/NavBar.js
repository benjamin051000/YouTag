import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, useLocation } from 'react-router-dom';

function NavBar(props) {
    const {pathname} = useLocation();
    
    const profile = props.profile;
    const profilePic = profile ? profile.getImageUrl() : "";
    const user_name = profile ? profile.getName() : "Error";

        return (
        <Navbar>
            <Navbar.Brand>YouTag</Navbar.Brand>
            <Nav className="container-fluid">
                
                {pathname.startsWith('/dashboard/') && <Link to="/dashboard">Back to Topics</Link>}

                <Nav.Item className="ml-auto">
                    <Dropdown alignRight>
                        <Dropdown.Toggle as={Nav.Link}>
                            <Image src={profilePic} roundedCircle alt="Google Profile Pic" width="40" height="40"/>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Header>Signed in as {user_name}</Dropdown.Header>
                            <Dropdown.Item onClick={props.handleAuthClick} variant="danger">Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>                 
                </Nav.Item>
            </Nav>
        </Navbar>
    );
}

export default NavBar;