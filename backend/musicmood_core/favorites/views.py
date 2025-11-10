from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FavoriteTrack
from .serializers import FavoriteTrackSerializer

DEFAULT_USER_ID = 'demo_user'

class FavoriteListView(APIView):
    # GET /api/favorites/
    def get(self, request, *args, **kwargs):
        favorites = FavoriteTrack.objects.filter(
            user_id=DEFAULT_USER_ID).order_by('-id')
        serializer = FavoriteTrackSerializer(favorites, many=True)
        return Response(serializer.data,
                        status=status.HTTP_200_OK)

    # POST /api/favorites/
    def post(self, request, *args, **kwargs):
        data = request.data.copy()

        if 'user_id' in data:
            data['user_id'] = DEFAULT_USER_ID

            #валидация полей
            required_fields = ['track_id', 'name_track',
                               'artist_name', 'audio_url',
                               'album_image']
            for field in required_fields:
                if field not in data:
                    return Response({'detail': 'required'},
                                    status=status.HTTP_400_BAD_REQUEST)
            if FavoriteTrack.objects.filter(user_id=data['user_id'],
                                            track_id=data['track_id']).exists():
                return Response({'detail': 'Трек уже в избранном'},
                                status=status.HTTP_409_CONFLICT)