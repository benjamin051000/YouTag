import React from 'react';
import { Link } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';

function CategoryList(props) {
    /* Generates the List of links of each category.
       Clicking a link redirects to a CategoryView for
       that topic. 
    */

    /* subInfo contains following structure: 
        { "topicID" : [{subscription}, {subscription}, {...}] } */
    let subInfo = props.subInfo;

    return (
        <div>
            <Button size="sm" onClick={props.getSubs} disabled={props.isLoading}>
                {props.isLoading ? <><Spinner animation="border" size="sm"/> Fetching Categories...</> : <>Fetch and Display Categories</>} 
            </Button>
            {/* TODO move this to where the other button is? */}

            <ListGroup>
            {
                Object.keys(subInfo).map((topic, index) => 
                    (
                        <ListGroup.Item>
                            <Link to={`/dashboard/${topic}`} key={topic}>
                                <h3>{topic} ({subInfo[topic].length} channels)</h3>
                            </Link>
                        </ListGroup.Item>
                    ))
            }
            </ListGroup>
        
        </div>
    );
}

export default CategoryList;