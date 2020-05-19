import React from 'react';
import { Link } from 'react-router-dom';


function CategoryView({ match, subInfo }) {
    
    let subs = subInfo[match.params.id];
    console.log(`CategoryView for ${match.params.id}:`, subs);

    return ( 
        <div>
            <Link to='/dashboard'>
                <button>Back to Topics</button>
            </Link>
            <h2>{match.params.id}</h2>
            <ul>
            {
                subs.map(sub =>
                (<li key={sub.snippet.title}>
                    <a href={`https://www.youtube.com/channel/${sub.snippet.resourceId.channelId}`} target="_blank" rel="noopener noreferrer">
                        {sub.snippet.title} {' '}
                        <img src={sub.snippet.thumbnails.default.url} alt={sub.snippet.title}/>
                    </a>
                </li>))
            }
            </ul>
        </div>
    );
}

export default CategoryView;