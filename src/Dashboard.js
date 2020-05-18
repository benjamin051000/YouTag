import React, { useState } from 'react';
import jsonIDs from './topicIds.json';  // Used to convert between topicIDs and human-readable topics.
import { Link } from 'react-router-dom';


async function getSubs(pageToken) {
    /* Fetch subscription list from the authenticated user in batches of 50. pageToken is optional. */
    let response = await window.gapi.client.youtube.subscriptions.list({
        'part': 'snippet',
        'maxResults': 50,  // This takes a little bit
        'mine': true,
        'pageToken': pageToken
    });
    return response.result;
}


async function getAllSubs() {
    /* Fetch all user subscriptions. GAPI only allows fetching of 50 subscriptions at a time, but has pagination. This allows us to loop through each new page until we exhaust all subscriptions. */

    let firstIteration = true; // Ensures loop will run once
    let subListResponse = null;
    let subs = [];

    // Keep looping while the responses have a nextPageToken.
    while (firstIteration || subListResponse.nextPageToken) {

        if (firstIteration)
            subListResponse = await getSubs(null);
        else
            subListResponse = await getSubs(subListResponse.nextPageToken);


        console.log('subListResponse:', subListResponse);
        // Add the new page of subscriptions to the total list.
        subs = subs.concat(subListResponse.items);

        firstIteration = false;
    }

    console.log('Subscription list:', subs);

    return subs;
}


async function getTopics(subInfo) {
    /* Fetch the topicDetails for each Channel in subInfo and add it into the subInfo object. */

    let channelIDs = subInfo.map(channel => channel.snippet.resourceId.channelId);

    let channelInfo = [];

    for (let i = 0; i < subInfo.length; i += 50) {

        let idlist = channelIDs.slice(i, i + 50).join();  // Default delimiter is a comma. slice()  handles out of bounds: Returns up until the end. Slice does not include i+50.
        console.log(`Fetching topicDetails for subInfo[${i}-${i + 50}]...`);

        let response = await window.gapi.client.youtube.channels.list({
            'part': 'topicDetails',
            'id': idlist
        });

        let result = response.result;

        console.log('Resulting topicDetails:', result);

        channelInfo = channelInfo.concat(result.items);
    }

    console.log('Received channel info:', channelInfo);

    // For each dsub, add its topicDetails if they are defined for that channel.
    for (let i = 0; i < subInfo.length; i++) {
        let channelId = subInfo[i].snippet.resourceId.channelId;

        for (let j = 0; j < channelInfo.length; j++) {
            if (channelInfo[j].id === channelId) {
                subInfo[i].topicDetails = channelInfo[j];
                break; // Move on to next iteration of dsubs
            }
        }
    }

    // Alert if any subs do not have topicDetails assigned to them
    for (let channel of subInfo) {
        if (!channel.topicDetails)
            console.log('This channel does not have any topics defined:', channel);
    }

    console.log('New subInfo with topicDetails:', subInfo);
    return subInfo;
}


function sortSubs(subInfo) {
    /* Places subscriptions into a dictionary with topics as keys and arrays of channels as values. */
    let categories = {};

    // For each subscription, iterate through each topic and add it to a topic.
    for (let sub of subInfo) {

        // Check that topicDetails exists.
        if (sub.topicDetails && sub.topicDetails.topicDetails) {

            // Iterate through each topic.
            for (let topic of sub.topicDetails.topicDetails.topicIds) {

                // If the key-val pair already exists, push it if it hasn't been pushed already.
                if (categories[topic]) {
                    /* Check if the element is already here. This is necessary because some topicID lists for channels include the same topicID twice. */
                    if (!categories[topic].find(e => e === sub))
                        categories[topic].push(sub);
                }
                else {
                    // Otherwise, create a new array starting with this subscription.
                    categories[topic] = [sub];
                }
            }
        }
        // If sub.topicDetails does not exist, add the sub to 'unfiled'
        else {
            if (categories['unfiled']) {
                categories['unfiled'].push(sub);
            }
            else {
                categories['unfiled'] = [sub];
            }
        }
    }

    console.log('Resulting categories:', categories);
    return categories;
}


function prettifyCats(categories) {
    /* Format channel info to be rendered in the DOM. */
    let pretty = [];

    for (let key in categories) {
        if (categories.hasOwnProperty(key)) {  // TODO is this necessary?

            let cat = key === 'unfiled' ? ['unfiled'] : [jsonIDs[key]];  // Category name is in the front.

            for (let sub of categories[key]) {
                cat.push(sub.snippet.title);
            }

            // Push the entire list of Channel titles to the output list.
            pretty.push(cat);
        }
    }
    return pretty;
}


async function handleFetch() {
    /* Handles the functions required to fetch the subscription information and the channel topic information at once. */
    let subInfo = await getAllSubs();
    subInfo = await getTopics(subInfo);
    return subInfo;
}


function handleDisplay(subInfo) {
    /* Handles category sorting and DOM rendering of Channels. */
    let sorted = sortSubs(subInfo);
    let pretty = prettifyCats(sorted);
    return pretty;
}


function Dashboard(props) {
    /* Component declaration */

    const [subInfo, updateSubInfo] = useState([]);
    const [prettyInfo, setPretty] = useState([]);

    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={async () => updateSubInfo(await handleFetch())}>Fetch Subscription info</button>

            <button onClick={() => setPretty(handleDisplay(subInfo))}>Sort and display data</button>

            <button onClick={props.handleAuthClick}>Logout</button>

                {   prettyInfo.length > 0 && // Displays when prettyCats is up
                    
                    prettyInfo.map(e => (
                        <Link to={`/dashboard/${e[0]}`}><h3>{e[0]} ({e.length - 1} channels)</h3>
                        </Link>
                        )
                    )
                }
        </div>
    );
}


export default Dashboard;
