"""
Admin API Views
Provides admin-only endpoints for managing time slots and viewing all bookings
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from events.models import TimeSlot, Category
from bookings.models import Booking
from .serializers import (
    TimeSlotSerializer, 
    BookingSerializer,
    AdminTimeSlotCreateSerializer,
    AdminTimeSlotSerializer,
    AdminBookingSerializer
)


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_timeslots_list_create(request):
    """
    GET/POST /api/admin/timeslots/
    Get all time slots or create a new one (admin only)
    """
    if request.method == 'GET':
        # Get all time slots with booking information
        queryset = TimeSlot.objects.select_related('category').prefetch_related(
            Prefetch('booking', queryset=Booking.objects.select_related('user'))
        ).order_by('start_time')
        
        # Filtering
        date_filter = request.GET.get('date')
        if date_filter:
            queryset = queryset.filter(start_time__date=date_filter)
        
        category_filter = request.GET.get('category')
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)
        
        status_filter = request.GET.get('status')  # 'booked', 'available'
        if status_filter == 'booked':
            queryset = queryset.filter(booking__isnull=False)
        elif status_filter == 'available':
            queryset = queryset.filter(booking__isnull=True)
        
        serializer = AdminTimeSlotSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create a new time slot
        serializer = AdminTimeSlotCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            timeslot = serializer.save()
            return Response(
                AdminTimeSlotSerializer(timeslot, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_timeslot_detail(request, timeslot_id):
    """
    GET/PUT/DELETE /api/admin/timeslots/{id}/
    Get, update, or delete a specific time slot (admin only)
    """
    timeslot = get_object_or_404(
        TimeSlot.objects.select_related('category').prefetch_related(
            Prefetch('booking', queryset=Booking.objects.select_related('user'))
        ),
        id=timeslot_id
    )
    
    if request.method == 'GET':
        serializer = AdminTimeSlotSerializer(timeslot, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = AdminTimeSlotCreateSerializer(
            timeslot, 
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Check if slot is booked and trying to change critical fields
            if hasattr(timeslot, 'booking'):
                critical_fields = ['start_time', 'end_time', 'category']
                if any(field in request.data for field in critical_fields):
                    return Response(
                        {"error": "Cannot modify time or category of booked slot"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            timeslot = serializer.save()
            return Response(
                AdminTimeSlotSerializer(timeslot, context={'request': request}).data
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Check if slot is booked
        if hasattr(timeslot, 'booking'):
            return Response(
                {"error": "Cannot delete booked time slot"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        timeslot.delete()
        return Response(
            {"message": "Time slot deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_bookings_list(request):
    """
    GET /api/admin/bookings/
    Get all bookings with detailed information (admin only)
    Supports filtering by date, user, category, and status
    """
    queryset = Booking.objects.select_related(
        'user', 'time_slot__category'
    ).order_by('-booked_at')
    
    # Filtering
    date_filter = request.GET.get('date')
    if date_filter:
        queryset = queryset.filter(time_slot__start_time__date=date_filter)
    
    user_filter = request.GET.get('user')
    if user_filter:
        queryset = queryset.filter(user__username__icontains=user_filter)
    
    category_filter = request.GET.get('category')
    if category_filter:
        queryset = queryset.filter(time_slot__category_id=category_filter)
    
    # Pagination support
    limit = request.GET.get('limit')
    if limit:
        try:
            limit = int(limit)
            queryset = queryset[:limit]
        except ValueError:
            pass
    
    serializer = AdminBookingSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_cancel_booking(request, booking_id):
    """
    DELETE /api/admin/bookings/{id}/
    Cancel a specific booking (admin only)
    """
    booking = get_object_or_404(
        Booking.objects.select_related('user', 'time_slot__category'),
        id=booking_id
    )
    
    # Admins can cancel any booking regardless of timing rules
    booking.delete()
    
    return Response(
        {"message": f"Booking {booking_id} cancelled successfully"},
        status=status.HTTP_204_NO_CONTENT
    )
