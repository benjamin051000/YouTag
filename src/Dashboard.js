import React, { useState } from 'react';
import jsonIDs from './topicIds.json';  // Used to convert between topicIDs and human-readable topics.
import { Route } from 'react-router-dom';

import CategoryView from './CategoryView';
import CategoryList from './CategoryList';


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
        console.log(`Fetching topicDetails for subInfo[${i}-${i + 49}]...`);

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

                let fTopic;
                // Change the topic from topicID to English. Use ftopic as dictionary key.
                try {
                    fTopic = jsonIDs[topic];
                }
                catch (e) {
                    fTopic = 'unfiled';
                }

                // If the key-val pair already exists, push it if it hasn't been pushed already.
                if (categories[fTopic]) {
                    /* Check if the element is already here. This is necessary because some topicID lists for channels include the same topicID twice. */
                    if (!categories[fTopic].find(e => e === sub))
                        categories[fTopic].push(sub);
                }
                else {
                    // Otherwise, create a new array starting with this subscription.
                    categories[fTopic] = [sub];
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

    console.log('Channels sorted by topic:', categories);
    return categories;
}


async function handleClick() {
    /* Handles the functions required to fetch the subscription information and the channel topic information at once. */
    let subInfo = await getAllSubs();
    subInfo = await getTopics(subInfo);

    let sorted = sortSubs(subInfo);
    // let pretty = prettifyCats(sorted);
    return sorted;
}


function Dashboard(props) {
    const [subInfo, setSubInfo] = useState({});

    const getSubs = async () => setSubInfo(await handleClick());

    return (
        <div>
            <h1>Dashboard</h1>
            <button onClick={props.handleAuthClick}>Logout</button>

            <Route path="/dashboard/:id" render={(props) => <CategoryView {...props} subInfo={subInfo}/>}/>
            <Route exact path="/dashboard" render={(props) => <CategoryList subInfo={subInfo} getSubs={getSubs}/>} />
        </div>
    );
}


export default Dashboard;