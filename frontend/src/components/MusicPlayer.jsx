import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons-fa';

const MusicPlayer = ({ currentTrack, currentPlaylist, onNext, onPrev }) => {
    const audioRef = useRef(null) //для доступа к DOM эл <audio>

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

//управление воспроизведением
    const togglePlayPause = () => {
            if (isPlaying){
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e=>console.error(e));
                }
            setIsPlaying(!isPlaying);
        };

//автоматический переход к следующему треку
    const handleTrackEnd = useCallback(()=>{
        setIsPlaying(false);
        onNext();
        }, [onNext]);

    //обновление плеера при смене трека
    useEffect(()=>{
        if (currentTrack && audioRef.current){
                audioRef.current.src = currentTrack.audio_url;
// автоматический запуск
                audioRef.current.load();
                audioRef.current.play().then(()=>setIsPlaying(true)).catch((e)=>console.error(e));
            }}, [currentTrack]);

    //настройка обработчиков событий для audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () =>{
                setDuration(audio.duration);
                setCurrentTime(audio.currentTime);
            };

        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const setPlay = () => setIsPlaying(true);
        const setPause = () => setIsPlaying(false);

        //привязка событий
        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('play', setPlay);
        audio.addEventListener('pause', setPause);
        audio.addEventListener('ended', handleTrackEnd);

}, [handleTrackEnd]);

// клик по прогресс бару
const handleProgressBarClick = (e) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
        const newTime = (clickPosition / progressBar.offsetWidth) * duration;
        audioRef.current.currentTime = newTime;
    };

// форматирование времени
const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString(); //подумать
        return `${minutes}:${seconds}`;
    };

if (!currentTrack) {
//         блок плеера виден в нижней части экрана
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
                        <Col xs={12} md={4} className='d-flex align-items-center'>
                            <img src={currentTrack.album_image}
                                 alt={currentTrack.name_track}
                                 style={{width: '40px', height: '40px', borderRadius: '5px'}}
                                 className='shadow-sm'
                             />
                        </Col>
                        <Col xs={12} md={4} className='d-flex justify-content-center align-items-center py-2 py-md-0'>
                            <Button variant='link' onClick={onPrev}
                            disabled={!currentPlaylist || currentPlaylist.length === 0}
                            className='text-dark p-1'>
                                <FaStepBackward size={20} />
                            </Button>
                            <Button variant='primary' onClick={togglePlayPause}
                            className='rounded-circle'
                            style={{width:'40px', height='40px'}} >
                                <PlayPauseIcon size={20} />
                            </Button>
                            <Button variant='link' onClick={onNext}
                            disabled={!currentPlaylist || currentPlaylist.length === 0}
                            className='text-dark p-1'>
                                <FaStepForward size={20} />
                            </Button>
                        </Col>
                        <Col xs={12} md={4}>
                            <div className='d-flex align-items-center'>
                                <small className='text-muted'>
                                    {formatTime(currentTime)}
                                </small>
                                <div className='flex-grow-1 position-relative'
                                onClick={handleProgressBarClick}
                                style={{cursor: 'pointer'}}>
                                    <ProgressBar
                                    now={(currentTime/duration) * 100}
                                    style={{height: '5px'}}
                                    className='bg-secondary bg-opacity-25'
                                    />
                                    <div className='position-absolute top-0 w-100 h-100'
                                    style={{z-index: 1}}></div>
                                </div>
                                <small className='text-muted'>
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