import React, { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { Container, Form } from 'react-bootstrap';
import TrackSearchResult from './TrackSearchResult';
import Player from './Player';
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: 'baa9feb35ac54b04bc6bea1f4608fc8b',
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch('');
  }
  console.log(searchResults);
  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  let cancel = false;
  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;
    if (cancel) return;
    spotifyApi.searchTracks(search).then((res) => {
      setSearchResults(
        res.body.tracks.items.map((track) => {
          const smallestAlbumimage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) {
                return image;
              } else {
                return smallest;
              }
            },
            track.album.images[0]
          );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumimage.url,
          };
        })
      );
      return () => (cancel = true);
    });
  }, [search, accessToken]);

  return (
    <Container className='d-flex flex-column' style={{ height: '100vh' }}>
      <Form.Control
        type='search'
        placeholder='Search Songs/Artists'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      ></Form.Control>
      <div className='flex-grow-1 my-2' style={{ overflowY: 'auto' }}>
        {searchResults.map((track) => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </Container>
  );
}
