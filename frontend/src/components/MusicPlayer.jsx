import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';

const MusicPlayer = ({ currentTrack, currentPlaylist, onNext, onPrev }) => {
    const audioRef = useRef(null); // для доступа к DOM эл <audio>

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Управление воспроизведением
    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error(e));
        }
        setIsPlaying(!isPlaying);
    };

    // Автоматический переход к следующему треку
    const handleTrackEnd = useCallback(() => {
        setIsPlaying(false);
        onNext();
    }, [onNext]);

    // Обновление плеера при смене трека
    useEffect(() => {
        if (currentTrack && audioRef.current) {
            audioRef.current.src = currentTrack.audio_url;
            // автоматический запуск
            audioRef.current.load();
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((e) => console.error("Ошибка воспроизведения:", e));
        }
    }, [currentTrack]);

    // Настройка обработчиков событий для audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const setPlay = () => setIsPlaying(true);
        const setPause = () => setIsPlaying(false);

        // привязка событий
        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('play', setPlay);
        audio.addEventListener('pause', setPause);
        audio.addEventListener('ended', handleTrackEnd);

        return () => {
            // Отписка от событий при размонтировании
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('play', setPlay);
            audio.removeEventListener('pause', setPause);
            audio.removeEventListener('ended', handleTrackEnd);
        };

    }, [handleTrackEnd]);

    // Клик по прогресс бару
    const handleProgressBarClick = (e) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
        const newTime = (clickPosition / progressBar.offsetWidth) * duration;
        if (Number.isFinite(newTime)) {
             audioRef.current.currentTime = newTime;
        }
    };

    // Форматирование времени
    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    if (!currentTrack) {
        // блок плеера виден в нижней части экрана (пустой)
        return (
            <div className='fixed-bottom bg-light border-top shadow-lg'>
                <Container className='py-3 text-center text-muted small'>
                    Плеер: выберите трек для воспроизведения
                </Container>
            </div>
        );
    }

    const PlayPauseIcon = isPlaying ? FaPause : FaPlay;

    return (
        <div className='fixed-bottom bg-light border-top shadow-lg'>
            <Container>
                <Card.Body className='p-2'>
                    <Row className='align-items-center'>
                        <Col xs={12} md={4} className='d-flex align-items-center justify-content-center justify-content-md-start'>
                            <img
                                src={currentTrack.album_image}
                                alt={currentTrack.name_track}
                                style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover' }}
                                className='shadow-sm me-3'
                            />
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                <div className="fw-bold text-truncate">{currentTrack.name_track}</div>
                                <div className="small text-muted text-truncate">{currentTrack.artist_name}</div>
                            </div>
                        </Col>

                        <Col xs={12} md={4} className='d-flex justify-content-center align-items-center py-2 py-md-0'>
                            <Button
                                variant='link'
                                onClick={onPrev}
                                disabled={!currentPlaylist || currentPlaylist.length === 0}
                                className='text-dark p-2'
                            >
                                <FaStepBackward size={20} />
                            </Button>

                            <Button
                                variant='primary'
                                onClick={togglePlayPause}
                                className='rounded-circle mx-3 d-flex align-items-center justify-content-center'
                                style={{ width: '40px', height: '40px' }} // ИСПРАВЛЕНО: height: '40px'
                            >
                                <PlayPauseIcon size={16} />
                            </Button>

                            <Button
                                variant='link'
                                onClick={onNext}
                                disabled={!currentPlaylist || currentPlaylist.length === 0}
                                className='text-dark p-2'
                            >
                                <FaStepForward size={20} />
                            </Button>
                        </Col>

                        {/* Прогресс бар */}
                        <Col xs={12} md={4}>
                            <div className='d-flex align-items-center'>
                                <small className='text-muted me-2' style={{ minWidth: '35px' }}>
                                    {formatTime(currentTime)}
                                </small>

                                <div
                                    className='flex-grow-1 position-relative bg-secondary bg-opacity-25 rounded'
                                    onClick={handleProgressBarClick}
                                    style={{ cursor: 'pointer', height: '5px' }}
                                >
                                    <div
                                        className="bg-primary h-100 rounded"
                                        style={{ width: `${(currentTime / duration) * 100}%` }}
                                    ></div>

                                    <div
                                        className='position-absolute top-0 w-100 h-100'
                                        style={{ zIndex: 1 }}
                                    ></div>
                                </div>

                                <small className='text-muted ms-2' style={{ minWidth: '35px' }}>
                                    {formatTime(duration)}
                                </small>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Container>
            <audio ref={audioRef} />
        </div>
    );
};

export default MusicPlayer;