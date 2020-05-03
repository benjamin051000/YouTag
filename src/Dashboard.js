import React, { useState } from 'react';
import topicIDs from './topicIds.json';

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

function getChannelIDs(dsubs) {
    return dsubs.map(channel => channel.snippet.resourceId.channelId);
}

async function getTopics(dsubs) {
    /* gets topics, duh */

    let ids = getChannelIDs(dsubs); 
    console.log('ids:', ids);

    let channelInfo = [];

    for(let i = 0; i < dsubs.length; i += 50) {

        let idlist = ids.slice(i, i+50).join();  // Default delimiter is a comma. slice()  handles out of bounds and just returns up until the end.
        console.log(`Fetching data for ${i}-${i+50}...`);

        let response = await window.gapi.client.youtube.channels.list({
            'part': 'topicDetails',
            'id': idlist  
        });

        let result = response.result;
        
        console.log('Resulting channel info:', result);
        channelInfo = channelInfo.concat(result.items); // TODO make this entire loop async so it can fetch all at once
    }

    console.log('Received channel info:', channelInfo);
    return channelInfo;
}


function Dashboard() {

    const [dsubs, updateSubs] = useState([]);

    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={async () => updateSubs(await getAllSubs())}>Fetch subscriptions</button>

            <button onClick={async () => await getTopics(dsubs)}>Fetch Channel Topics</button>

            
                <ol>
                    {
                        dsubs.length > 1 &&
                        dsubs.map(s => <li key={s.snippet.title}>{s.snippet.title}
                        <img src={s.snippet.thumbnails.default.url} alt='Channel thumbnail'/>
                        </li>)
                    }
                </ol>
            

        </div>
    );
}

export default Dashboard;
