from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import datetime


def send_booking_created_event(booking):
    """
    Отправляет WebSocket событие о создании нового бронирования
    """
    channel_layer = get_channel_layer()
    
    # Подготавливаем данные для отправки
    booking_data = {
        'id': booking.id,
        'timeslot_id': booking.time_slot.id,
        'user': {
            'id': booking.user.id,
            'username': booking.user.username,
        },
        'timeslot': {
            'id': booking.time_slot.id,
            'date': booking.time_slot.date.isoformat(),
            'start_time': booking.time_slot.start_time.strftime('%H:%M'),
            'end_time': booking.time_slot.end_time.strftime('%H:%M'),
            'category': booking.time_slot.category.name,
        },
        'created_at': booking.created_at.isoformat(),
    }
    
    # Отправляем событие всем подключенным клиентам
    async_to_sync(channel_layer.group_send)(
        "calendar_updates",
        {
            "type": "booking_created",
            "data": booking_data
        }
    )


def send_booking_cancelled_event(booking_data):
    """
    Отправляет WebSocket событие об отмене бронирования
    booking_data - данные удаленного бронирования (объект может быть уже удален)
    """
    channel_layer = get_channel_layer()
    
    # Отправляем событие всем подключенным клиентам
    async_to_sync(channel_layer.group_send)(
        "calendar_updates",
        {
            "type": "booking_cancelled",
            "data": booking_data
        }
    )


def send_timeslot_created_event(timeslot):
    """
    Отправляет WebSocket событие о создании нового временного слота
    """
    channel_layer = get_channel_layer()
    
    # Подготавливаем данные для отправки
    timeslot_data = {
        'id': timeslot.id,
        'date': timeslot.date.isoformat(),
        'start_time': timeslot.start_time.strftime('%H:%M'),
        'end_time': timeslot.end_time.strftime('%H:%M'),
        'category': timeslot.category.name,
        'is_available': True,  # Новый слот всегда доступен
        'created_at': timeslot.created_at.isoformat(),
    }
    
    # Отправляем событие всем подключенным клиентам
    async_to_sync(channel_layer.group_send)(
        "calendar_updates",
        {
            "type": "timeslot_created",
            "data": timeslot_data
        }
    )


def send_timeslot_deleted_event(timeslot):
    """
    Отправляет WebSocket событие об удалении временного слота
    """
    channel_layer = get_channel_layer()
    
    # Подготавливаем данные для отправки
    timeslot_data = {
        'id': timeslot.id,
        'date': timeslot.start_time.date().isoformat(),
        'start_time': timeslot.start_time.strftime('%H:%M'),
        'end_time': timeslot.end_time.strftime('%H:%M'),
        'category': timeslot.category.name,
        'deleted_at': datetime.now().isoformat(),
    }
    
    # Отправляем событие всем подключенным клиентам
    async_to_sync(channel_layer.group_send)(
        "calendar_updates",
        {
            "type": "timeslot_deleted",
            "data": timeslot_data
        }
    )
