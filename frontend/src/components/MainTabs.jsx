import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Tabs, Tab, Alert, Spinner, Form, Button, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
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
    { key: 'joy', name: 'Радость', icon: '😀' },
    { key: 'calm', name: 'Спокойствие', icon: '🧘‍♂️' },
    { key: 'energy', name: 'Энергия', icon: '💃' },
    { key: 'sadness', name: 'Грусть', icon: '😪' },
    { key: 'focus', name: 'Фокус', icon: '🧠' },
];

const MainTabs = ({ onTrackPlay, currentTrack, setCurrentPlaylist }) => {
    const [key, setKey] = useState('mood'); // активная вкладка
    const [tracks, setTracks] = useState([]); // текущий список треков
    const [favorites, setFavorites] = useState([]); // список избранного
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMood, setActiveMood] = useState('joy');
    const [timeOfDay, setTimeOfDay] = useState(''); // Для отображения времени суток

    // Проверка является ли трек избранным
    const isFavorite = useMemo(() => {
        const favTrackIds = new Set(favorites.map(fav => fav.track_id));
        return (track) => favTrackIds.has(track.track_id);
    }, [favorites]);

    //   ЛОГИКА ИЗБРАННОГО
    const fetchFavorites = useCallback(async () => {
        try {
            const response = await getFavorites();
            setFavorites(response.data);
            return response.data;
        } catch (e) {
            console.error("Ошибка загрузки избранного:", e);
            return [];
        }
    }, []);

    const handleToggleFavorite = async (track) => {
        const favStatus = isFavorite(track);
        try {
            if (favStatus) {
                await removeFavorite(track.track_id);
                setFavorites(prev => prev.filter(fav => fav.track_id !== track.track_id));

                // Если мы на вкладке избранного, сразу убираем трек из списка отображения
                if (key === 'favorites') {
                    setTracks(prev => prev.filter(t => t.track_id !== track.track_id));
                    setCurrentPlaylist(prev => prev.filter(t => t.track_id !== track.track_id));
                }
            } else {
                const response = await addFavorites(track);
                setFavorites(prev => [response.data, ...prev]);
            }
        } catch (e) {
            console.error("Ошибка обновления избранного:", e);
            alert("Не удалось обновить избранное");
        }
    };

    //  ЛОГИКА ЗАГРУЗКИ ТРЕКОВ
    const loadContent = useCallback(async (activeKey, mood = activeMood) => {
        setLoading(true);
        setError(null);
        let newTracks = [];

        try {
            // Сначала всегда обновляем избранное, чтобы сердечки были актуальны
            const favData = await fetchFavorites();

            if (activeKey === 'mood') {
                const response = await getTracksByMood(mood);
                newTracks = response.data;
            } else if (activeKey === 'collection') {
                const response = await getTracksByTime();
                newTracks = response.data.tracks || [];
                setTimeOfDay(response.data.time_of_day);
            } else if (activeKey === 'favorites') {
                newTracks = favData;
            }

            setTracks(newTracks);
            setCurrentPlaylist(newTracks);
        } catch (e) {
            setError('Не удалось загрузить треки. Проверьте соединение.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [activeMood, setCurrentPlaylist, fetchFavorites]);

    // ПОИСК
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await searchTracks(searchQuery);
            setTracks(response.data);
            setCurrentPlaylist(response.data);
            // Сбрасываем вкладку, чтобы не горели "Mood" или "Favorites"
            setKey('results');
        } catch (e) {
            setError('Ошибка поиска');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Смена настроения (клик по смайлику)
    const handleMoodClick = (moodKey) => {
        setActiveMood(moodKey);
        loadContent('mood', moodKey);
    };

    // Загрузка при смене вкладки
    useEffect(() => {
        if (key !== 'results') {
            loadContent(key);
        }
    }, [key, loadContent]);


    // Компонент списка треков (внутренний)
    const TrackListRender = ({ list }) => (
        <Row className='mt-4 g-3 justify-content-center'>
            {list && list.length > 0 ? (
                list.map(track => (
                    <TrackCard
                        key={track.track_id}
                        track={track}
                        isFavorite={isFavorite(track)}
                        onPlay={onTrackPlay}
                        onToggleFavorite={handleToggleFavorite}
                    />
                ))
            ) : (
                !loading && (
                    <Col>
                        <Alert variant='info' className="text-center">
                            {key === 'favorites'
                                ? "У вас пока нет избранных треков."
                                : "Треки не найдены."}
                        </Alert>
                    </Col>
                )
            )}
        </Row>
    );

    return (



        );
}

