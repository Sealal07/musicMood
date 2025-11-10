import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .functions import get_time_of_day
from backend.config import JAMENDO_URL, JAMENDO_CLIENT_ID

# словарь на теги Jamendo

MOOD_TAGS = {
    'joy': 'pop',
    'calm': 'chillout',
    'energy': 'rock',
    'sadness': 'ambient',
    'focus': 'classical',
}

TIME_TAGS = {
    'morning': 'energetic',
    'afternoon': 'light',
    'evening': 'relax',
    'night': 'sleep',
}

def get_jamendo_tracks(tag=None, search_query=None):
    params = {
        'client_id': JAMENDO_CLIENT_ID,
        'format': 'json',
        'limit': 20,
        'imagesize': 200,
    }
    if tag:
        params['tags'] = tag
        params['order'] = 'popularity_week'

    if search_query:
        params['search'] = search_query
        params['order'] = 'name'

    try:
        response = requests.get(JAMENDO_URL, params=params)
        response.raise_for_status()
        data = response.json()

        if data.get('results'):
            tracks = [
                {
                    'track_id': track['id'],
                    'name_tracks': track['name'],
                    'artist_name': track['artist_name'],
                    'audio_url': track['audio'],
                    'album_image': track['image'],
                }
                for track in data['results']
                if track.get('audio')
            ]
            return tracks
        return []
    except requests.exceptions.RequestException as e:
        print(f'jamendo API error: {e}')
        return []
# POST /api/tracks/
class TrackListView(APIView):
    def post(self, request, *args, **kwargs):
        search_query = request.data.get('query')
        mood_name = request.data.get('mood')

        if search_query:
            tracks = get_jamendo_tracks(search_query=search_query)
            return Response(tracks, status=status.HTTP_200_OK)

        if mood_name and mood_name in MOOD_TAGS:
            tag = MOOD_TAGS[mood_name]
            tracks = get_jamendo_tracks(tag=tag)
            return Response(tracks, status=status.HTTP_200_OK)

        return Response({'detail': 'Неверный запрос'},
                         status = status.HTTP_400_BAD_REQUEST)

# GET /api/tracks/mood/
class TimeOfDayTrackListView(APIView):
    def get(self, request, *args, **kwargs):
        time_of_day = get_time_of_day()
        tag = TIME_TAGS.get(time_of_day)

        if tag:
            tracks = get_jamendo_tracks(tag=tag)
            return Response({'time_of_day': time_of_day,
                             'tracks': tracks},
                            status=status.HTTP_200_OK)
        return Response({'detail': 'Не удалось определить время суток'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


