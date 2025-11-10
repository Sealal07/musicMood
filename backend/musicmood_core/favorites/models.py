from django.db import models

class FavoriteTrack(models.Model):
    user_id = models.CharField(max_length=255)
    track_id = models.CharField(max_length=255)

    name_track = models.CharField(max_length=512)
    artist_name = models.CharField(max_length=255)
    audio_url = models.URLField()
    album_image = models.URLField()

    class Meta:
        unique_together = ('user_id', 'track_id')
        verbose_name = 'Избранный трек'
        verbose_name_plural = 'Избранные треки'

    def __str__(self):
        return f'{self.name_track} by {self.artist_name} ({self.user_id})'