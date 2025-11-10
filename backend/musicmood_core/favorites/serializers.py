from rest_framework import serializers
from .models import FavoriteTrack


class FavoriteTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteTrack
        fields = '__all__' #включаем все поля модели