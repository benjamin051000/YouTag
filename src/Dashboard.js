import React, { useState } from 'react';

async function getSubs(pageToken) {
    let response = await window.gapi.client.youtube.subscriptions.list({
        'part': 'snippet',
        'maxResults': 50,  // This takes a little bit
        'mine': true,
        'pageToken': pageToken
    });
    return response.result;
}

async function getAllSubs() {
    /* Get all user subscriptions. */
    let subs = [];
    let firstIteration = true; // Ensures it'll run once
    let subListResponse = null;

    // Check for a nextPageToken
    while (firstIteration || subListResponse.nextPageToken) {

        // Get results
        if (firstIteration)
            subListResponse = await getSubs(null);
        else {
            console.log('Getting results for page', subListResponse.nextPageToken);
            subListResponse = await getSubs(subListResponse.nextPageToken);
        }
        // TODO ensure valid result?

        console.log(subListResponse);

        // Add the subscriptions to the list
        subs = subs.concat(subListResponse.items);

        firstIteration = false;
    }

    console.log(subs);

    return subs;
}

function Dashboard() {

    const [dsubs, updateSubs] = useState([]);

    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={async () => updateSubs(await getAllSubs())}>Fetch subscriptions</button>

            
                <ol>
                    {
                        dsubs.length > 1 &&
                        dsubs.map(s => <li key={s.snippet.title}>{s.snippet.title}
                        <img src={s.snippet.thumbnails.default.url}/>
                        </li>)
                    }
                </ol>
            

        </div>
    );
}

export default Dashboard;
