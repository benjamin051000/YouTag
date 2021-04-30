/**
 * Functions to fetch Subscription information via GAPI, and compile the data together.
 */

/**
 * Fetch all user subscriptions. GAPI only allows fetching 
 * of 50 subscriptions at a time, but has pagination. 
 * 
 * This allows us to loop through each new page until we 
 * exhaust all subscriptions.
 * @returns 
 */
async function getAllSubs() {

    let firstIteration = true; // Ensures loop will run once
    let subListResponse = null;
    let nextPageToken = null;
    let subs = [];

    // Keep looping while the responses have a nextPageToken.
    while (firstIteration || nextPageToken) {
        /* Fetch subscription list from the authenticated user in batches of 50. pageToken is optional. */
        let response = await window.gapi.client.youtube.subscriptions.list({
            'part': 'snippet',
            'maxResults': 50,  // This takes a little bit
            'mine': true,
            'pageToken': nextPageToken
        });
        subListResponse = response.result;

        console.debug('[getAllSubs] subListResponse:', subListResponse);

        // Add the new page of subscriptions to the total list.
        subs = subs.concat(subListResponse.items);

        nextPageToken = subListResponse.nextPageToken;

        firstIteration = false;
    }

    console.log('[getAllSubs] Raw subscription list:', subs);

    return subs;
}


/**
 * Fetch the topicDetails for each Channel in 
 * subInfo and add it into the subInfo object.
 * @param {*} subInfo 
 * @returns 
 */
async function getTopics(subInfo) {
    /* Fetch the topicDetails for each Channel in subInfo and add it into the subInfo object. */
    
    // List of channel IDs (to retrieve topic info for)
    let channelIDs = subInfo.map(channel => channel.snippet.resourceId.channelId);
    // Output array of channel info
    let channelTopicInfo = [];

    // Fetch TopicDetails and ContentDetails in batches of 50.
    for (let i = 0; i < subInfo.length; i += 50) {
        // Default delimiter is a comma. 
        // slice() handles out of bounds: Returns up until the end. Slice does not include i+50.
        let ids_to_fetch = channelIDs.slice(i, i + 50).join();
        console.debug(`[getTopics] Fetching topicDetails for subInfo[${i}-${i + 49}]...`);
        
        // Fetch from YouTube API
        let response = await window.gapi.client.youtube.channels.list({
            'part': 'topicDetails, contentDetails',
            'id': ids_to_fetch
        });
        let result = response.result;

        console.debug('[getTopics] Resulting topicDetails:', result);

        channelTopicInfo = channelTopicInfo.concat(result.items);
    }

    // All topic info has arrived
    console.log('[getTopics] Received channel topic info:', channelTopicInfo);

    // For each Subscription object, add topicDetails if they are defined for that channel.
    // TODO figure out what this does
    for (let i = 0; i < subInfo.length; i++) {
        let channelId = subInfo[i].snippet.resourceId.channelId;

        for (let j = 0; j < channelTopicInfo.length; j++) {
            if (channelTopicInfo[j].id === channelId) {
                subInfo[i].topicDetails = channelTopicInfo[j]; // TODO consider just using .push to remove a layer here
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
}  // end of getTopics