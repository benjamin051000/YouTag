import React, { useState, useEffect } from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Media from 'react-bootstrap/Media';

async function getVideos(channels) {
    /* Returns a list of video snippets for the given channels.
    Returns an array of playListItemResponse objects. */

    console.log('Getting videos from the following channels:', channels);

    // Extract playlist IDs from the channels provided.
    const playlistIDs = channels.map(
        channel => channel.topicDetails.contentDetails.relatedPlaylists.uploads
    );

    console.log('Getting playlists:', playlistIDs);

    // Use Promise.all to send all queries at the same time.
    const getVideosFromID = (playlistID) => window.gapi.client.youtube.playlistItems.list({
        "part": "snippet",
        // "maxResults": 50,
        "playlistId": playlistID
    });
    const promises = playlistIDs.map(id => getVideosFromID(id));
    const response = await Promise.all(promises);

    let videos = [];
    for (let e of response) {
        videos.push(...e.result.items);
    }

    // Sort the videos based on date published, newest first.
    videos.sort((a, b) => {
        const da = new Date(a.snippet.publishedAt);
        const db = new Date(b.snippet.publishedAt);
        return db - da; // Returns either a positive, negative, or zero.
    });

    console.log('Sorted videos:', videos);

    return videos;
} // end of getVideos

function timeSinceUploaded(video) {
    /* Returns a string contatining the time since
    the video was uploaded. */
    const publishedAt = new Date(video.snippet.publishedAt);
    const now = Date.now();

    let elapsed = now - publishedAt;

    // Must convert elapsed to a Date object first
    // let seconds = elapsed.getSeconds();
    // let minutes = elapsed.getMinutes();
    // let hours = elapsed.getHours();
    // let days = elapsed.getDay();
    // // let weeks = elapsed.getWeek();
    // let months = elapsed.getMonth();
    // let years = elapsed.getFullYear();

    // Strip milliseconds
    elapsed /= 1000;
    let seconds = Math.round(elapsed % 60);
    // Strip seconds
    elapsed /= 60;
    // Etc. for others
    let minutes = Math.round(elapsed % 60);
    elapsed /= 60;
    let hours = Math.round(elapsed % 24);
    elapsed /= 24;
    let days = Math.round(elapsed % 7);
    elapsed /= 7;
    let weeks = Math.round(elapsed % 4);
    elapsed /= 4;
    let months = Math.round(elapsed % 12);
    elapsed /= 12;
    let years = Math.round(elapsed);

    let output;
    // Format output
    if (years > 0)
        output = `${years}y ${months}m`;
    else if (months > 0)
        output = `${months}mo`;
    else if (weeks > 0)
        output = `${weeks}w`;
    else if (days > 0)
        output = `${days}d`;
    else if (hours > 0)
        output = `${hours}h`;
    else
        output = `${minutes}m ${seconds}s`;

    output += ' ago';
    // output = `${years}y ${months}mo ${weeks}w ${days}d ${hours}hr ${minutes}m ${seconds}s ago`;

    return output;
}

function CategoryView({ match, subInfo }) {
    const [vids, setVids] = useState([]);

    // Runs when component mounts.
    useEffect(() => {
        const handleMount = async () => {
            setVids(await getVideos(subInfo[match.params.id]));
        }
        handleMount();
    }, []);

    let subs = subInfo[match.params.id];

    return (
        <div>
            <h2><u>{match.params.id}</u></h2>
            <Container>
                <Row>
                    <Col>
                        <ListGroup>
                            {
                                subs.map(sub => // TODO we changed what's stored in vids, apply that change here I guess. :(
                                    (<ListGroup.Item key={sub.snippet.title}>
                                        <a href={`https://www.youtube.com/channel/${sub.snippet.resourceId.channelId}`} target="_blank" rel="noopener noreferrer">
                                            <Media>
                                                <img src={sub.snippet.thumbnails.default.url} alt={sub.snippet.title} />
                                                <Media.Body>
                                                    {sub.snippet.title}
                                                </Media.Body>
                                            </Media>
                                        </a>
                                    </ListGroup.Item>))
                            }
                        </ListGroup>
                    </Col>
                    <Col>
                        <ol>
                            {vids.length > 0 &&

                                vids.map(video => {
                                    const videoLink = `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`;
                                    const snippet = video.snippet;
                                    return (
                                        <li key={snippet.resourceId.videoId}>
                                            <Card>
                                                <a href={videoLink} target="_blank" rel="noopener noreferrer">
                                                    <Card.Img variant="top" src={snippet.thumbnails.high.url} />
                                                </a>
                                                <Card.Body>
                                                    <a href={videoLink} target="_blank" rel="noopener noreferrer">
                                                        <Card.Title>{snippet.title}</Card.Title>
                                                    </a>
                                                    <a href={`https://www.youtube.com/channel/${snippet.channelId}`} target="_blank" rel="noopener noreferrer">
                                                        <Card.Subtitle>{snippet.channelTitle}</Card.Subtitle>
                                                    </a>
                                                    <Card.Text>
                                                        {timeSinceUploaded(video)}
                                                    </Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </li>
                                    );
                                })
                            }
                        </ol>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default CategoryView;