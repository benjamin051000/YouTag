import React from 'react';

function CategoryView({ match }) {
    console.log(match);
    return (
        <h3>{match.params.id}</h3>
    );
}

export default CategoryView;