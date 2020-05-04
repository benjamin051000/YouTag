import React, { useState } from 'react';
import jsonIDs from './topicIds.json';

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

    // For each dsub, add its topicDetails if they are defined for that channel.
    for(let i = 0; i < dsubs.length; i++) {
        let channelId = dsubs[i].snippet.resourceId.channelId;

        for(let j = 0; j < channelInfo.length; j++) {
            if(channelInfo[j].id === channelId) {
                dsubs[i].topicDetails = channelInfo[j];
                break; // Move on to next iteration of dsubs
            }
        }
    }

    // Alert if any subs do not have topicDetails assigned to them
    for(let channel of dsubs) {
        if(!channel.topicDetails)
            console.log('This channel does not have any topics defined:', channel);
    }

    console.log('new dsubs:', dsubs);
    return dsubs;
}

function sortSubs(subs) {
    // Sorts the subs into a dictionary.
    let categories = {};

    console.log('sorting', subs);

    // For each subscription, iterate through each topic and add it to a topic.
    for(let s of subs) {

        if(s.topicDetails && s.topicDetails.topicDetails) {

            for(let topic of s.topicDetails.topicDetails.topicIds) {
                
                // If the key-val pair already exists, push it if it hasn't been pushed already.
                if(categories[topic]) {
                    /* Check if the element is already here. This is necessary because some topicID lists for channels include the same topicID twice. */
                    if(!categories[topic].find(e => e === s))
                        categories[topic].push(s);
                }
                else {
                    categories[topic] = [s];
                }
            }
        }
        else {
            // If s.topicDetails does not exist, add it under 'unfiled'
            if(categories['unfiled']) {
                categories['unfiled'].push(s);
            }
            else {
                categories['unfiled'] = [s];
            }
        }
    }

    console.log(categories);
    return categories;
}

function formatCategoryNames(categories) {
    /* Format subscriptions to be rendered in the DOM. */ 

    let output = [];

    for(let key in categories) {
        if(categories.hasOwnProperty(key)) {  // TODO is this necessary?
            let cat = [jsonIDs[key]];  // Category name is in the front.
            for(let sub of categories[key]) {
                cat.push(sub.snippet.title);
            }
            output.push(cat);
        }
    }
    return output;
}

function Dashboard() {

    const [subs, updateSubs] = useState([]);
    const [categories, setCategories] = useState({});
    const [prettyCats, setPretty] = useState([]);


    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={async () => updateSubs(await getAllSubs())}>Fetch subscriptions</button>

            <button onClick={async () => {
                updateSubs(await getTopics(subs));
            }}>Fetch Channel Topics</button>

            <button onClick={() => setCategories(sortSubs(subs))}>Sort channels by topic</button>

            <button onClick={() => setPretty(formatCategoryNames(categories))}>Display categories</button> {/* TODO save this to a state and do something similar to the below HTML insertion */}

            
                {/* <ol>
                    {
                        subs.length > 1 &&
                        subs.map(s => <li key={s.snippet.title}>{s.snippet.title},
                        <img src={s.snippet.thumbnails.default.url} alt='Channel thumbnail'/>
                        </li>)
                    }
                </ol> */}

                <ul>
                    {
                        prettyCats.length > 0 &&
                        prettyCats.map(e =>
                            // First one is a ul
                        <li key={e[0]}><h3>{e[0]} ({e.length-1} channels)</h3>
                                <ol>
                                {
                                    e.map((i, idx) => {
                                        if(idx >= 1) return (
                                            <li key={i+idx}><span>{i}</span></li>
                                        )
                                    })
                                }
                                </ol>
                            </li>)
                    }
                </ul>
            

        </div>
    );
}

export default Dashboard;
