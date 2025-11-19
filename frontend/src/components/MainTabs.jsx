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
    const [key, setKey] = useState('mood');
    const [tracks, setTracks] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMood, setActiveMood] = useState('joy');
    const [timeOfDay, setTimeOfDay] = useState('');

    const isFavorite = useMemo(() => {
        const favTrackIds = new Set(favorites.map(fav => fav.track_id));
        return (track) => favTrackIds.has(track.track_id);
    }, [favorites]);

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

    const loadContent = useCallback(async (activeKey, mood = activeMood) => {
        setLoading(true);
        setError(null);
        let newTracks = [];

        try {
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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await searchTracks(searchQuery);
            setTracks(response.data);
            setCurrentPlaylist(response.data);
            setKey('results');
        } catch (e) {
            setError('Ошибка поиска');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleMoodClick = (moodKey) => {
        setActiveMood(moodKey);
        loadContent('mood', moodKey);
    };

    useEffect(() => {
        if (key !== 'results') {
            loadContent(key);
        }
    }, [key, loadContent]);

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
        <Container className='py-4'>
            <h2 className='text-center mb-4 text-primary'>
                MusicMood
            </h2>
            <Form onSubmit={handleSearch} className='mb-4'>
                <InputGroup size='lg'>
                    <Form.Control
                        placeholder='Найти трек...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant='primary' type='submit'>
                        <FaSearch />
                    </Button>
                </InputGroup>
            </Form>

            {key === 'results' ? (
                <>
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                        <h4>Результаты поиска: '{searchQuery}'</h4>
                        <Button variant='link' onClick={() => setKey('mood')}>
                            Вернуться назад
                        </Button>
                    </div>
                    {error && <Alert variant='danger'>{error}</Alert>}
                    {loading ? (
                        <div className='text-center py-5'>
                            <Spinner animation='border' variant='primary' />
                        </div>
                    ) : (
                        <TrackListRender list={tracks} />
                    )}
                </>
            ) : (
                <Tabs
                    id='main-tabs'
                    activeKey={key}
                    onSelect={(k) => setKey(k)}
                    className='mb-3 nav-pills justify-content-center'
                >
                    <Tab eventKey='mood' title='По настроению'>
                        <div className='d-flex justify-content-center gap-3 my-3 flex-wrap'>
                            {MOODS.map((m) => (
                                <Button
                                    key={m.key}
                                    variant={activeMood === m.key ? 'primary' : 'outline-primary'}
                                    onClick={() => handleMoodClick(m.key)}
                                    className='rounded-pill px-4 py-2 d-flex align-items-center gap-2'
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{m.icon}</span> {m.name}
                                </Button>
                            ))}
                        </div>
                        {error && <Alert variant='danger'>{error}</Alert>}
                        {loading ? (
                            <div className='text-center py-5'>
                                <Spinner animation='border' variant='primary' />
                            </div>
                        ) : (
                            <TrackListRender list={tracks} />
                        )}
                    </Tab>

                    <Tab eventKey='collection' title='Подборка'>
                        <div className='text-center my-3'>
                            {timeOfDay && (
                                <h4 className='text-muted'>
                                    Сейчас: {timeOfDay === 'morning' ? 'Утро' :
                                        timeOfDay === 'afternoon' ? 'День' :
                                        timeOfDay === 'evening' ? 'Вечер' : 'Ночь'
                                    }
                                </h4>
                            )}
                        </div>
                        {error && <Alert variant='danger'>{error}</Alert>}
                        {loading ? (
                            <div className='text-center py-5'>
                                <Spinner animation='border' variant='primary' />
                            </div>
                        ) : (
                            <TrackListRender list={tracks} />
                        )}
                    </Tab>

                    <Tab eventKey='favorites' title='Избранное'>
                        {error && <Alert variant='danger'>{error}</Alert>}
                        {loading ? (
                            <div className='text-center py-5'>
                                <Spinner animation='border' variant='primary' />
                            </div>
                        ) : (
                            <TrackListRender list={tracks} />
                        )}
                    </Tab>
                </Tabs>
            )}
        </Container>
    );
};

export default MainTabs;