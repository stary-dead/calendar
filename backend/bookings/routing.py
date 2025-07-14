from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/calendar/", consumers.CalendarConsumer.as_asgi()),
]
