/**
 * Functions to fetch Subscription information via GAPI, and compile the data together.
 */
import jsonIDs from '../topicIds.json';  // Used to convert between topicIDs and human-readable topics.

import testSubInfo from '../test_data/unsorted_sublist.json'; // For testing purposes


/**
 * Fetch all user subscriptions. GAPI only allows fetching 
 * of 50 subscriptions at a time, but has pagination. 
 * 
 * This allows us to loop through each new page until we 
 * exhaust all subscriptions.
 * @returns 
 */
async function getAllSubs() {
    console.group('getAllSubs()');

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

        console.debug('subListResponse:', subListResponse);

        // Add the new page of subscriptions to the total list.
        subs = subs.concat(subListResponse.items);

        nextPageToken = subListResponse.nextPageToken;

        firstIteration = false;
    }

    console.log('Raw subscription list:', subs);

    console.groupEnd();
    return subs;
} // end of getAllSubs()


/**
 * Fetch the topicDetails for each Channel in 
 * subInfo and add it into the subInfo object.
 * @param {*} subInfo 
 * @returns 
 */
async function getTopics(subInfo) {
    console.group('getTopics()');
    
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

    console.groupEnd();
    return subInfo;
}  // end of getTopics()


/* Places subscriptions into a dictionary with topics as keys and arrays of channels as values. */
function sortSubs(subInfo) {
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
} // end of sortSubs()

/**
 * API function to collect Subscription 
 * Information, Topic Information, and agglomerate 
 * it into one sorted dictionary.
 */
export async function getSortedSubs() {
    let subInfo = await getAllSubs();

    let subInfoWithTopics = await getTopics(subInfo);

    let sorted = sortSubs(subInfoWithTopics);

    return sorted;
};

/* For testing purposes. This uses prerecorded test data (which may be out of date)
    to reduce Google API requests. NOTE: You should click categories with few channels to
    further reduce API calls. */
export function loadTestData() {
    console.log('[loadTestData] Test data loaded from file:', testSubInfo);
    let sorted = sortSubs(testSubInfo);
    return sorted;
}