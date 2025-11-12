from django.urls import path
from .views import FavoriteListView, FavoriteDeleteView

urlpatterns = [
    path('favorites/', FavoriteListView.as_view(),
         name='favorite-list'),
    path('favorites/delete/', FavoriteDeleteView.as_view(),
         name='favorite-delete'),
]