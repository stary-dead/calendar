# API Endpoints

## Authentication Endpoints

### User Authentication
- `POST /api/auth/login/` - User login with username/password
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/register/` - User registration
- `GET /api/auth/user/` - Get current user information
- `GET /api/auth/csrf/` - Get CSRF token for forms

## OAuth Endpoints

### OAuth Status and Management
- `GET /api/oauth/status/` - Check OAuth providers availability
- `GET /api/oauth/accounts/` - Get user's connected social accounts

### OAuth Login (django-allauth)
- `GET /oauth/google/login/` - Google OAuth login redirect
- `GET /oauth/github/login/` - GitHub OAuth login redirect
- `GET /oauth/google/login/callback/` - Google OAuth callback handler
- `GET /oauth/github/login/callback/` - GitHub OAuth callback handler

## User API Endpoints

### Categories
- `GET /api/categories/` - Get all event categories (Cat 1, Cat 2, Cat 3)
  - **Access**: Public (AllowAny)
  - **Purpose**: List available booking categories

### Time Slots
- `GET /api/timeslots/` - Get time slots with filtering
  - **Access**: Authenticated users
  - **Parameters**:
    - `date` (YYYY-MM-DD) - Filter by specific date
    - `start_date` (YYYY-MM-DD) - Filter by date range start
    - `end_date` (YYYY-MM-DD) - Filter by date range end
    - `categories` (array) - Filter by category names
    - `available_only` (boolean) - Show only available slots
  - **Purpose**: Get bookable time slots for calendar view

### Bookings
- `POST /api/bookings/` - Create new booking
  - **Access**: Authenticated users
  - **Body**: `{ "time_slot": <timeslot_id> }`
  - **Purpose**: Book a time slot

- `DELETE /api/bookings/{id}/` - Cancel booking
  - **Access**: Authenticated users (own bookings only)
  - **Purpose**: Cancel user's own booking

- `GET /api/user/bookings/` - Get user's bookings
  - **Access**: Authenticated users
  - **Parameters**:
    - `status` - Filter by 'upcoming' or 'past'
  - **Purpose**: List user's booking history

## Admin API Endpoints

### Admin Time Slots Management
- `GET /api/admin/timeslots/` - Get all time slots (admin view)
  - **Access**: Admin users only
  - **Parameters**:
    - `date` (YYYY-MM-DD) - Filter by date
    - `category` (id) - Filter by category ID
    - `status` - Filter by 'booked' or 'available'
  - **Purpose**: Admin overview of all time slots

- `POST /api/admin/timeslots/` - Create new time slot
  - **Access**: Admin users only
  - **Body**: Time slot data (start_time, end_time, category)
  - **Purpose**: Create new bookable time slots

- `GET /api/admin/timeslots/{id}/` - Get specific time slot details
  - **Access**: Admin users only
  - **Purpose**: View detailed time slot information

- `PUT /api/admin/timeslots/{id}/` - Update time slot
  - **Access**: Admin users only
  - **Purpose**: Modify existing time slot

- `DELETE /api/admin/timeslots/{id}/` - Delete time slot
  - **Access**: Admin users only
  - **Purpose**: Remove time slot (cancels any existing booking)

### Admin Bookings Management
- `GET /api/admin/bookings/` - Get all bookings (admin view)
  - **Access**: Admin users only
  - **Parameters**:
    - `date` (YYYY-MM-DD) - Filter by booking date
    - `user` (string) - Filter by username
    - `category` (id) - Filter by category ID
    - `limit` (number) - Limit results for pagination
  - **Purpose**: Admin overview of all user bookings

- `DELETE /api/admin/bookings/{id}/` - Cancel any booking (admin)
  - **Access**: Admin users only
  - **Purpose**: Admin can cancel any user's booking

## API Documentation

### Auto-generated Documentation
- `GET /api/schema/` - OpenAPI schema
- `GET /api/docs/` - Swagger UI documentation

## WebSocket Endpoints

### Real-time Updates
- `WS /ws/calendar/` - WebSocket connection for real-time updates
  - **Access**: Authenticated users only
  - **Purpose**: Receive real-time booking and time slot updates

### WebSocket Events
- `booking_created` - New booking created
- `booking_cancelled` - Booking cancelled
- `timeslot_created` - New time slot created
- `timeslot_deleted` - Time slot deleted

## Request/Response Format

### Authentication
All authenticated endpoints require:
- **Session-based authentication** (cookies)
- **CSRF token** in headers for POST/PUT/DELETE requests

### Error Responses
Standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

### Content Type
- All requests/responses use `application/json`
- CSRF token passed in `X-CSRFToken` header

## Access Control

### Permission Levels
- **Public**: No authentication required
- **Authenticated**: Requires user login
- **Admin**: Requires staff/admin user status

### Rate Limiting
- No explicit rate limiting implemented
- Relies on Django's built-in protection mechanisms

## CORS Configuration
- Configured for frontend domain
- Supports credentials (cookies)
- Allows necessary headers for authentication
