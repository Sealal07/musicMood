import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Tabs, Tab, Alert, Button, Spinner, Form, FormControl } from 'react-bootstrap';
import { FaSmile, FaSearch, FaHeart } from 'react-icons/fa';
import TrackCard from './TrackCard';

import {
    searchTracks,
    getTracksByMood,
    getTracksByTime,
    getFavorites,
    addFavorites,
    removeFavorite
    } from '../api/api';

const MOODS = [
        {key: 'joy', name: 'Радость', icon: '😀' },
        {key: 'calm', name: 'Спокойствие', icon: '🧘‍♂️' },
        {key: 'energy', name: 'Энергия', icon: '💃' },
        {key: 'sadness', name: 'Грусть', icon: '😪' },
        {key: 'focus', name: 'Сосредоточенность', icon: '🧠' },
];

const MainTabs = ({ onTrackPlay, currentTrack, setCurrentPlaylist }) => {
        const [key, setKey] = useState('mood'); // активная вкладка
        const [tracks, setTracks] = useState([]); // текущий список треков
        const [favorites, setFavorites] = useState([]);//список избранного
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const [searchQuery, setSearchQuery] = useState('');
        const [activeMood, setActiveMood] = useState('joy');

        //проверка является ли трек избранным

        const isFavorite = useMemo(() => {
        const favTrackIds = new Map(favorites.map(fav => [fav.track_id, true]));
        return (track) => favTrackIds.has(track.track_id);
        }, [favorites]);

//         ЛОГИКА ИЗБРАННОГО
        const fetchFavorites = async () => {
                try{
                    const response = await getFavorites();
                    setFavorites(response.data);
                    }catch (e) {
                        console.error(e);
                    }
            };
        const handleToggleFavorite = async (track) => {
            const favStatus = isFavorite(track);
            try {
                if (favStatus){
                    await removeFavorite(track.track_id);
                    setFavorites(prev => prev.filter(fav.track_id !== track.track_id));
                } else {
                    const response = await addFavorites(track);
                    setFavorites(prev => [response.data, ...prev]);
                    }
                } catch (e) {
                    console.error(e);
                }
            };
//         ЛОГИКА ЗАКГРУЗКИ ТРЕКОВ
//     функция для загрузки контента вкладок
    const loadContent = useCallback(async (activeKey) => {
            setLoading(true);
            setError(null);
            let newTracks = [];
            try{
                if (activeKey === 'mood') {
                    const response = await getTracksByMood(activeMood);
                    newTracks = response.data;
                } else if (activeKey === 'collection'){
                    const response = await getTracksByTime();
                    newTracks = response.data;
                } else if (activeKey === 'favorites'){
                    await fetchFavorites();
                    newTracks = favorites;
                    setLoading(false);
                    setTracks(newTracks);
                    setCurrentPlaylist(newTracks);
                    return;
                }
//                 если мы не на вкладке "избранное"
                setTracks(newTracks);
                setCurrentPlaylist(newTracks);
            } catch(e) {
                    setError('не удалось загрузить треки');
                    console.error(e);
            } finally{
                setLoading(false);
            }

        }, [activeMood, favorites, setCurrentPlaylist]);
// поиск
        const handleSearch = async (e) => {
                e.preventDefault();
                if(!searchQuery.trim()) return;

                setLoading(true);
                setError(null);
                try{
                      const response = await searchTracks(searchQuery);
                      setTracks(response.data);
                      setCurrentPlaylist(response.data);
                      setKey('results'); //переключаемся на кладку результатов
                }catch (e){
                    setError('ошибка поиска');
                    console.error(e);
                } finally {
                    setLoading(false);
                }

            };

//    запуск при смене активной вкладки или настроения
    useEffect(()=>{
        if(key !== 'results'){
            loadContent(key);
        }
        if (key === 'favorites'){
            fetchFavorites(key);
        }
    }, [key, activeMood, loadContent]);

//     Компонент для отображения списка треков

    const TrackList = ({list}=>(
            <Row className='mt-4'>
                {list.length > 0 ? (
                    list.map(track => (
                            <TrackCard key={track.track_id}
                            track={track}
                            isFavorite={isFavorite(track)}
                            onPlay={onTrackPlay}
                            onToggleFavorite={handleToggleFavorite}
                            />
                        ))
                    ): (
                        <Col><Alert variant='info'>
                                Треки не найдены
                                </Alert>
                        </Col>
                        )
                )}
            </Row>
        );
    return (



        );
}

