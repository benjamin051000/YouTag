import React, { useState } from 'react';
import { Link } from 'react-router-dom';

async function getVideos(channels) {
    /* Returns a list of video snippets for the given channels.
    Returns an array of playListItemResponse objects. */

    console.log('Getting videos from the following channels:', channels);

    // Extract playlist IDs from the channels provided.
    let playlistIDs = channels.map(channel => channel.topicDetails.contentDetails.relatedPlaylists.uploads);

    console.log('Getting playlists:', playlistIDs);

    let videos = [];

    // Make the requests in batches of 50.
    // for (let i=0; i < playlistIDs.length; i += 50) {
    //     let batch = playlistIDs.slice(i, i+50).join(); // Default delimiter is a comma. slice()  handles out of bounds: Returns up until the end. Slice does not include i+50.

    //     console.log(`Fetching videos from playlists ${i}-${i + 49}...`);

    //     console.log('batch:', batch);

    //     let response = await window.gapi.client.youtube.playlistItems.list({
    //         "part": "snippet",
    //         "playlistId": batch // ERROR: playlistId does not support comma-separated values.
    //     });

    //     let result = response.result;
    //     console.log('Resulting video snippets:', result);
    // }

    for(let id of playlistIDs) {
        let response = await window.gapi.client.youtube.playlistItems.list({
            "part": "snippet",
            // "maxResults": 50,
            "playlistId": id
        });
        let result = response.result;
        
        videos = videos.concat(result.items);
    }

    // Sort the videos based on date published, newest first.
    videos.sort((a, b) => {
        let da = new Date(a.snippet.publishedAt);
        let db = new Date(b.snippet.publishedAt);
        return db - da; // Returns either a positive, negative, or zero.
    });

    console.log('Sorted videos:', videos);

    return videos;
}

function CategoryView({ match, subInfo }) {
    const [vids, setVids] = useState([]);
    
    let subs = subInfo[match.params.id];
    console.log(`CategoryView for ${match.params.id}:`, subs);

    return ( 
        <div>
            <Link to='/dashboard'>
                <button>Back to Topics</button>
            </Link>
            <h2><u>{match.params.id}</u></h2>
            <ul>
            {
                subs.map(sub => // TODO we changed what's stored in vids, apply that change here I guess. :(
                (<li key={sub.snippet.title}>
                    <a href={`https://www.youtube.com/channel/${sub.snippet.resourceId.channelId}`} target="_blank" rel="noopener noreferrer">
                        {sub.snippet.title} {' '}
                        <img src={sub.snippet.thumbnails.default.url} alt={sub.snippet.title}/>
                    </a>
                </li>))
            }
            </ul>

            <br/>
            <h2><u>Videos</u></h2>
            <button onClick={async () => setVids(await getVideos(subInfo[match.params.id]))}>Get Videos</button>
            <br/>
            { vids.length > 0 &&
                vids.map(video => {
                    let videoLink = `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`
                    return (
                        <>
                        <a href={videoLink} target="_blank" rel="noopener noreferrer">
                            <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title}/>
                            [{video.snippet.channelTitle}] {video.snippet.title}
                            </a>
                        <br/>
                        </>
                    );
                })
            }

        </div>
    );
}

export default CategoryView;