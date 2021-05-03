import React, { useState } from 'react';
import { Route } from 'react-router-dom';

import styled from 'styled-components';
import Button from 'react-bootstrap/Button';

import CategoryView from '../CategoryView'; 
import CategoryList from '../CategoryList';
import NavBar from '../NavBar';


import { getSortedSubs, loadTestData } from '../functions/Subscriptions.js';

const Style = styled.div`
    .dashboard {
        text-align: center;
    }
`;

export default function Dashboard(props) {
    const [subInfo, setSubInfo] = useState({});
    const [isLoading, setLoading] = useState(false);

    const profile = props.profile;

    const handleClick = async () => {
        setLoading(true);
        setSubInfo(await getSortedSubs());
        setLoading(false);
    };

    return (
        <Style>
            <div className='dashboard'>
                <NavBar handleAuthClick={props.handleAuthClick} profile={props.profile} />

                <Route path="/dashboard/:id" render={(props) =>
                    <CategoryView {...props} subInfo={subInfo} />
                } />

                {
                    profile && <h3>Welcome, {profile.getName()}.</h3>
                }

                {/* Button for loading test information. */}
                <Button variant="outline-warning" size="sm" onClick={() => setSubInfo(loadTestData())}>Load Test Data (Warning: Developers only)</Button>

                <Route exact path="/dashboard" render={(props) =>
                    <CategoryList {...props} subInfo={subInfo} getSubs={handleClick} isLoading={isLoading} />
                } />


            </div>
        </Style>
    );
}