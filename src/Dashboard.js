import React, { useState } from 'react';
import jsonIDs from './topicIds.json';  // Used to convert between topicIDs and human-readable topics.
import { Route } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

import CategoryView from './CategoryView';
import CategoryList from './CategoryList';
import NavBar from './NavBar';

import styled from 'styled-components';

// For testing purposes
import testSubInfo from './test_data/unsorted_sublist.json';


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

    console.log('[getAllSubs] Subscription list:', subs);

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
            'part': 'topicDetails, contentDetails',
            'id': idlist
        });

        let result = response.result;

        console.log('[getTopics] Resulting topicDetails:', result);

        channelInfo = channelInfo.concat(result.items);
    }

    // // Batch the channelIDs into groups of 50.
    // let channelIDBatches = [];
    // for (let i = 0; i < subInfo.length; i+=50) {
    //     channelIDBatches.push(channelIDs.slice(i, i+50).join());
    // }

    // const getTopicContentDetails = (id) => window.gapi.client.youtube.channels.list({
    //     'part': 'topicDetails, contentDetails',
    //     'id': id
    // });
    // const promises = channelIDBatches.map(id => getTopicContentDetails(id));
    // const response = await Promise.all(promises);

    // // let channelInfo = [];
    // for(let e of response) {
    //     channelInfo.push(...e.result.items);
    // }

    console.log('[getTopics] Received channel info:', channelInfo);

    // For each dsub, add its topicDetails if they are defined for that channel.
    for (let i = 0; i < subInfo.length; i++) {
        let channelId = subInfo[i].snippet.resourceId.channelId;

        for (let j = 0; j < channelInfo.length; j++) {
            if (channelInfo[j].id === channelId) {
                subInfo[i].topicDetails = channelInfo[j]; // TODO consider just using .push to remove a layer here
                break; // Move on to next iteration of dsubs
            }
        }
    }

    // Alert if any subs do not have topicDetails assigned to them
    for (let channel of subInfo) {
        if (!channel.topicDetails || Object.entries(channel.topicDetails) === 0)
            console.error(`[getTopics] Channel "${channel.snippet.title}" does not have any topics defined:`, channel);
    }

    console.log('[getTopics] New subInfo with topicDetails and upload links:', subInfo);
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

    console.log('[sortSubs] Channels sorted by topic:', categories);
    return categories;
}


async function handleClick() {
    /* Handles the functions required to fetch the subscription information and the channel topic information at once. */
    let subInfo = await getAllSubs();
    
    let subInfoWTopics = await getTopics(subInfo);
    
    let sorted = sortSubs(subInfoWTopics);
    
    // let pretty = prettifyCats(sorted);
    return sorted;
}


function loadTestData() {
    /* For testing purposes. This uses prerecorded test data (which may be out of date)
    to reduce Google API requests. NOTE: You should click categories with few channels to
    further reduce API calls. */
    console.log('Test data loaded from file:', testSubInfo);
    let sorted = sortSubs(testSubInfo);
    return sorted;
}

const Style = styled.div`
    .dashboard {
        text-align: center;
    }
`;

function Dashboard(props) {
    const [subInfo, setSubInfo] = useState({});
    // State for loading icon on Fetch Categories button
    const [isLoading, setLoading] = useState(false);

    const getSubs = async () => {
        setLoading(true);
        setSubInfo(await handleClick());
        setLoading(false);
    };

    const profile = props.profile;

    return (
        <Style>
            <div className='dashboard'>
                <NavBar handleAuthClick={props.handleAuthClick} profile={props.profile} />

                <Route path="/dashboard/:id" render={(props) =>
                    <CategoryView {...props} subInfo={subInfo} />
                } />

                {
                    profile && <h3>Welcome, {profile.getName()}.</h3>
                }

                {/* Button for loading test information. */}
                <Button variant="outline-warning" size="sm" onClick={() => setSubInfo(loadTestData())}>Load Test Data (Warning: Developers only)</Button>

                <Route exact path="/dashboard" render={(props) =>
                    <CategoryList {...props} subInfo={subInfo} getSubs={getSubs} isLoading={isLoading} />
                } />


            </div>
        </Style>
    );
}


export default Dashboard;