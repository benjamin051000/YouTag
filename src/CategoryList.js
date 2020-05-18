import React from 'react';
import CategoryView from './CategoryView';


function CategoryList(props) {
    console.log(props);
    return (
        <button onClick={props.getSubs}>Fetch and Display Categories</button>
    );
}

export default CategoryList;