import React from 'react';

function CategoryView({ match, subInfo }) {

    console.log('CategoryView subInfo:', subInfo);

    let subs = subInfo.find((e) => e[0] === match.params.id)

    return ( 
        <div>
        {
            subs.map(e =>
                (<p>{e}</p>)
            )
        }
        </div>
    );
}

export default CategoryView;