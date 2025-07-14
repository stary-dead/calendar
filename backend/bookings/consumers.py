import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class CalendarConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Подключение пользователя к WebSocket
        """
        # Проверяем аутентификацию
        if self.scope["user"] == AnonymousUser():
            # Отклоняем неавторизованных пользователей
            await self.close()
            return
        
        # Добавляем пользователя в общую группу календаря
        self.calendar_group_name = "calendar_updates"
        
        await self.channel_layer.group_add(
            self.calendar_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        """
        Отключение пользователя от WebSocket
        """
        # Удаляем пользователя из группы
        if hasattr(self, 'calendar_group_name'):
            await self.channel_layer.group_discard(
                self.calendar_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """
        Получение сообщения от клиента (пока не используется)
        """
        pass
    
    # Обработчики событий от group_send
    async def booking_created(self, event):
        """
        Отправка уведомления о новом бронировании
        """
        await self.send(text_data=json.dumps({
            'type': 'booking_created',
            'data': event['data']
        }))
    
    async def booking_cancelled(self, event):
        """
        Отправка уведомления об отмене бронирования
        """
        await self.send(text_data=json.dumps({
            'type': 'booking_cancelled',
            'data': event['data']
        }))
    
    async def timeslot_created(self, event):
        """
        Отправка уведомления о новом временном слоте
        """
        await self.send(text_data=json.dumps({
            'type': 'timeslot_created',
            'data': event['data']
        }))

    async def timeslot_deleted(self, event):
        """
        Отправка уведомления о удалении временного слота
        """
        await self.send(text_data=json.dumps({
            'type': 'timeslot_deleted',
            'data': event['data']
        }))
