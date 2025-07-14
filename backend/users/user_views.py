# User API Views (REST API)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta

from events.models import Category, TimeSlot
from bookings.models import Booking
from bookings.websocket_utils import send_booking_created_event, send_booking_cancelled_event
from users.models import UserPreference
from users.serializers import (
    CategorySerializer, UserPreferenceSerializer, TimeSlotSerializer,
    BookingCreateSerializer, BookingSerializer, UserBookingSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def categories_list(request):
    """GET /api/categories/ - список категорий"""
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_preferences(request):
    """GET/POST /api/user/preferences/ - предпочтения пользователя"""
    preferences, created = UserPreference.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserPreferenceSerializer(preferences)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserPreferenceSerializer(preferences, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def timeslots_list(request):
    """GET /api/timeslots/ - слоты с фильтрацией по дате/категории"""
    queryset = TimeSlot.objects.select_related('category', 'created_by').prefetch_related('booking')
    
    # Фильтрация по дате
    date_param = request.GET.get('date')
    if date_param:
        try:
            filter_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            queryset = queryset.filter(start_time__date=filter_date)
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Фильтрация по диапазону дат (неделя)
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    if start_date and end_date:
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
            queryset = queryset.filter(
                start_time__date__gte=start_dt,
                start_time__date__lte=end_dt
            )
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Фильтрация по категориям
    categories = request.GET.getlist('categories')
    if categories:
        queryset = queryset.filter(category__name__in=categories)
    
    # Фильтрация только доступных слотов
    available_only = request.GET.get('available_only', 'false').lower() == 'true'
    if available_only:
        queryset = queryset.filter(booking__isnull=True)
    
    # Сортировка по времени
    queryset = queryset.order_by('start_time')
    
    serializer = TimeSlotSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """POST /api/bookings/ - создание бронирования"""
    serializer = BookingCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        booking = serializer.save()
        
        # Отправляем WebSocket событие о новом бронировании
        send_booking_created_event(booking)
        
        response_serializer = UserBookingSerializer(booking)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    """DELETE /api/bookings/{id}/ - отмена бронирования"""
    booking = get_object_or_404(Booking, id=booking_id, user=request.user)
    
    can_cancel, message = booking.can_cancel()
    if not can_cancel:
        return Response(
            {'error': message}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Подготавливаем данные для WebSocket события перед удалением
    booking_data = {
        'id': booking.id,
        'timeslot_id': booking.time_slot.id,
        'user': {
            'id': booking.user.id,
            'username': booking.user.username,
        },
        'timeslot': {
            'id': booking.time_slot.id,
            'date': booking.time_slot.start_time.date().isoformat(),
            'start_time': booking.time_slot.start_time.strftime('%H:%M'),
            'end_time': booking.time_slot.end_time.strftime('%H:%M'),
            'category': booking.time_slot.category.name,
        },
    }
    
    booking.delete()
    
    # Отправляем WebSocket событие об отмене бронирования
    send_booking_cancelled_event(booking_data)
    
    return Response({'message': 'Booking cancelled successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    """GET /api/user/bookings/ - мои бронирования"""
    bookings = Booking.objects.filter(user=request.user).select_related(
        'time_slot__category'
    ).order_by('-booked_at')
    
    # Фильтрация по статусу (upcoming/past)
    status_filter = request.GET.get('status')
    now = timezone.now()
    
    if status_filter == 'upcoming':
        bookings = bookings.filter(time_slot__start_time__gte=now)
    elif status_filter == 'past':
        bookings = bookings.filter(time_slot__start_time__lt=now)
    
    serializer = UserBookingSerializer(bookings, many=True)
    return Response(serializer.data)
