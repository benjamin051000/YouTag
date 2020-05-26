import React from 'react';
import { Link } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

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
        <Button size="sm" onClick={props.getSubs}>Fetch and Display Categories</Button>

            {
                Object.keys(subInfo).map((topic, index) => 
                    (
                        <Link to={`/dashboard/${topic}`} key={topic}>
                            <h3>{topic} ({subInfo[topic].length} channels)</h3>
                        </Link>
                    ))
            }
        
        </div>
    );
}

export default CategoryList;