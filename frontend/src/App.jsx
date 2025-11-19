import React, { useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MainTabs from './components/MainTabs';
import MusicPlayer from './components/MusicPlayer';

 const App = () => {
     const [currentTrack, setCurrentTrack] = useState(null);
     const [currentPlaylist, setCurrentPlaylist] = useState([]);

     const handleTrackPlay = (track) => {
         setCurrentTrack(track);
     };

     const handleNext = useCallback(() => {
         if (!currentTrack || currentPlaylist.length === 0) return;
            const currentIndex = currentPlaylist.findIndex(t => t.track_id === currentTrack.track_id);
            if (currentIndex !== -1 && currentIndex < currentPlaylist.length - 1){
                setCurrentTrack(currentPlaylist[currentIndex + 1]);
            }
        }, [currentTrack, currentPlaylist]);

     const handlePrev = useCallback(() => {
         if (!currentTrack || currentPlaylist.length === 0) return;
            const currentIndex = currentPlaylist.findIndex(t => t.track_id === currentTrack.track_id);
            if (currentIndex > 0){
                setCurrentTrack(currentPlaylist[currentIndex - 1]);
            }
        }, [currentTrack, currentPlaylist]);

    return (
        <div className='d-flex-column min-vh-100 bg-light'>
            <div className='flex-grow-1 w-100' style={{ paddingBottom: '100px' }}>
                <MainTabs
                    onTrackPlay={handleTrackPlay}
                    currentTrack={currentTrack}
                    setCurrentPlaylist={setCurrentPlaylist}
                />
            </div>
            <MusicPlayer
                currentTrack={currentTrack}
                currentPlaylist={currentPlaylist}
                onNext={handleNext}
                onPrev={handlePrev}
           />
           </div>
        );

     }

export default App;
