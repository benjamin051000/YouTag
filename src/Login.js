import React from 'react';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import lakeimg from './lake.jpg';

const Style = styled.div`
    .bgimg {
        background: url(${lakeimg}) no-repeat center;

        min-height: 100vh;
        background-size: cover;
        position: relative;
    }

    .login {
        color: white;
        text-align: center;
        padding: 150px 0;
    }

    footer {
        position: absolute;
        bottom: 0;
    }
`;


function Login(props) {
    /* TODO see https://developers.google.com/identity/branding-guidelines for CSS guidelines */
    return (
        <Style>
            <div className='bgimg'>
                <div className='login'>
                <h1>YouTag</h1>
                <h3>A simple way to organize your content.</h3>
                <p>Sign in with your Google account to get started.</p>

                <Button onClick={props.handleAuthClick}>Sign in with Google</Button>
                
                </div>

                <footer>
                    <a href="https://www.reddit.com/r/EarthPorn/comments/gyogj7/early_morning_at_lindeman_lakebccanada_oc4000x6016/">Background image credits</a>
                </footer>
            </div>
            
        </Style>
       
    );
}


export default Login;
