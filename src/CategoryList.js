import React from 'react';
import { Link } from 'react-router-dom';


function CategoryList(props) {
    return (
        <div>
        <button onClick={props.getSubs}>Fetch and Display Categories</button>

        {   props.subInfo.length > 0 && // Displays when prettyCats is up
                
            props.subInfo.map(e => (
                <Link key={e} to={`/dashboard/${e[0]}`}><h3>{e[0]} ({e.length - 1} channels)</h3>
                </Link>
                )
            )
        }
        </div>
    );
}

export default CategoryList;