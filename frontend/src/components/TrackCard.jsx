import React from 'react';
import { Card, Button, Col } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaPlay} from 'react-icons/fa';

// отображение информации о треке и кнопки действий
// props: track, isFavorite, onPlay, onToggleFavorite

const TrackCard = ({track, isFavorite, onPlay, onToggleFavorite})=>{
     const {track_id, name_track, artist_name, album_image} = track;

     const HeartIcon = isFavorite ? FaHeart : FaRegHeart;
     const heartColor = isFavorite ? 'danger' : 'outline-secondary';

// функция для вызова переключения избранного
    const handleToggleFavorite = (e) => {
            e.stopPropagation(); //останавливаем всплытие, чтобы не сработал клик по карточке
            onToggleFavorite(track);
        };

    return (
            <Col md={6} lg={4} className='mb-4'>
                <Card
                    className='shadow-sm h-100'
                    style={{ cursor: 'pointer' }}
                >
                <Card.Body
                    onClick={()=>onPlay(track)}
                    className='d-flex align-items-center'
                >
                <div className="flex-shrink-0">
                    <img
                        src={album_image}
                        alt={name_track}
                        style={{ width: '60px', height: '60px',
                            borderRadius: '5px'}}
                        className="shadow-sm"
                    />
                </div>
                <div className='flex-grow-1 overflow-hidden'>
                    <Card.Title className='text-truncate mb-0'>
                        {name_track}
                    </Card.Title>
                    <Card.Text className='text-muted small text-truncate'>
                        {artist_name}
                    </Card.Text>
                </div>
                <Button
                        variant='link'
                        onClick={(e) => { e.stopPropagation(); onPlay(track); }}
                        className='p-0 text-primary'
                >
                    <FaPlay size={18} />
                </Button>
                <Button
                    variant={heartColor}
                    onClick={handleToggleFavorite}
                    size='sm'
                    className='p-0 border-0'
                >
                    <HeartIcon size={18} />
                </Button>
            </Card.Body>
           </Card>
          </Col>
        );
    };
export default TrackCard;