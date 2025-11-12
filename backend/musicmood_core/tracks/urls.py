from django.urls import path
from .views import TrackListView, TimeOfDayTrackListView

urlpatterns = [
    path('tracks/', TrackListView.as_view(),
         name='track-list'),
    path('tracks/mood/', TimeOfDayTrackListView.as_view(),
         name='time-of-day-tracks'),
]