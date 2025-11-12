import axios from 'axios';

const API_BASE_URL = 'http://27.0.0.1:8000/api';
const DEFAULT_USER_ID = 'demo_user';

//поиск треков
export const searchTracks = async (query) => {
//    POST /api/tracks/
    return axios.post(`${API_BASE_URL}/tracks/`, {query});
};

//по настроению
export const getTracksByMood = async (mood) => {
// POST /api/tracks/
    return axios.post(`${API_BASE_URL}/tracks/`, {mood});
};

//по времени суток
export const getTracksByTime = async () => {
// GET /api/tracks/mood/
    return axios.get(`${API_BASE_URL}/tracks/mood/`);
};

//получение избранного
export const getFavorites = async (userId=DEFAULT_USER_ID) => {
// GET /api/favorites/
    return axios.get(`${API_BASE_URL}/favorites/`, {
        params: {user_id: userId}
    });
};


//добавление в избранное
export const addFavotites = async (track) => {
//POST /api/favorites/
    cons dataToSend = {
        user_id: DEFAULT_USER_ID,
        track_id: track.track_id,
        name_track: track.name_track,
        artist_name: track.artist_name,
        audio_url: track.audio_url,
        album_image: track.album_image,
    };
    return axios.post(`${API_BASE_URL}/favorites/`, dataToSend);
};

//удаление из избранного
export const removeFavorite = async (trackId) => {
// POST api/favorites/delete/
    return axios.post(`${API_BASE_URL}/favorites/delete/`, {
        user_id: DEFAULT_USER_ID,
        track_id: trackId,
    });
};
