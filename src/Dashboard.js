import React from 'react';

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

        // console.log('Next page:', subListResponse.nextPageToken);
        // Fetch again for the new page.

        // Get results
        if (firstIteration)
            subListResponse = await getSubs();
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
}

function Dashboard() {

    // let dsubs = [];

    // const handleClick = () => {
    //     dsubs.push(getAllSubs());
    // }

    // let subscriptions = dsubs.length === 0 ? null : 
    // (
    //     <ol>
    //         {dsubs.map(sub => <li>{sub}</li>)}
    //     </ol>
    // );

    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={getAllSubs}>Fetch subscriptions</button>

        </div>
    );
}

export default Dashboard;
