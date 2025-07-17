# System Architecture

## Overview

The Event Booking Calendar is a full-stack web application built with a microservices architecture using Docker containers. The system consists of 5 main services that work together to provide a real-time booking experience.

## System Components

### 1. Frontend (Angular)
- **Technology**: Angular 20 with TypeScript
- **Location**: Port 4200 (development)
- **Purpose**: User interface and real-time updates
- **Key Features**:
  - Calendar view with time slots
  - User authentication (login/register + OAuth)
  - Real-time WebSocket communication
  - Admin panel for slot management
  - Responsive design with Angular Material

### 2. Backend (Django)
- **Technology**: Django 4.2 with Django REST Framework
- **Location**: Port 8000 (internal)
- **Purpose**: API server and WebSocket handler
- **Key Features**:
  - RESTful API endpoints
  - WebSocket support via Django Channels
  - User authentication and authorization
  - OAuth integration (Google, GitHub)
  - Admin interface

### 3. Database (PostgreSQL)
- **Technology**: PostgreSQL 15
- **Location**: Port 5432 (internal)
- **Purpose**: Primary data storage
- **Stores**:
  - User accounts and profiles
  - Time slots and categories
  - Bookings and relationships
  - OAuth account information

### 4. Cache & Message Broker (Redis)
- **Technology**: Redis 7 Alpine
- **Location**: Port 6379 (internal)
- **Purpose**: WebSocket backend and caching
- **Functions**:
  - Django Channels layer backend
  - Real-time message broadcasting
  - Session storage
  - Caching for improved performance

### 5. Reverse Proxy (Nginx)
- **Technology**: Nginx
- **Location**: Port 80 (public)
- **Purpose**: Load balancing and static file serving
- **Handles**:
  - Static file serving (CSS, JS, images)
  - API request routing
  - WebSocket connection upgrades
  - SSL termination (if configured)

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   Admin Panel   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          │ HTTP/WebSocket        │
          │                      │
    ┌─────▼──────────────────────▼─────┐
    │           Nginx                  │
    │        (Port 80)                 │
    │   - Reverse Proxy                │
    │   - Static Files                 │
    │   - WebSocket Upgrade            │
    └─────┬────────────────────────────┘
          │
          │ Proxy to Backend
          │
    ┌─────▼─────────────────────────────┐
    │        Django Backend            │
    │         (Port 8000)              │
    │   - REST API                     │
    │   - WebSocket Consumers          │
    │   - Authentication               │
    │   - OAuth Integration            │
    └─────┬─────────────────────┬──────┘
          │                     │
          │ Database            │ Redis
          │ Operations          │ WebSocket
          │                     │
    ┌─────▼─────────┐     ┌─────▼─────────┐
    │  PostgreSQL   │     │     Redis     │
    │   (Port 5432) │     │   (Port 6379) │
    │  - User Data  │     │  - WebSocket  │
    │  - Bookings   │     │  - Sessions   │
    │  - Time Slots │     │  - Cache      │
    └───────────────┘     └───────────────┘
```

## Communication Flow

### 1. HTTP API Communication
1. **User Request**: Browser → Nginx → Django Backend
2. **Database Query**: Django → PostgreSQL
3. **Response**: PostgreSQL → Django → Nginx → Browser

### 2. WebSocket Communication
1. **Connection**: Browser → Nginx (WebSocket upgrade) → Django Channels
2. **Message Routing**: Django Channels → Redis (Channel Layer)
3. **Broadcasting**: Redis → All Connected Clients

### 3. Authentication Flow
1. **Regular Auth**: Username/Password → Django Authentication
2. **OAuth Flow**: External Provider → Django Allauth → User Session
3. **Session Management**: Django Sessions → Redis Storage

## Data Flow

### Booking Creation Flow
```
User Action → Angular Frontend → HTTP POST → Django API → 
Database Write → WebSocket Message → Redis Channel Layer → 
All Connected Clients → Real-time Update
```

### Real-time Updates
1. **Trigger**: User creates/cancels booking
2. **WebSocket Event**: Django broadcasts to Redis
3. **Distribution**: Redis sends to all connected clients
4. **UI Update**: Angular components update automatically

## WebSocket Architecture

### Channel Layer
- **Backend**: Redis as channel layer backend
- **Groups**: All users in "calendar_updates" group
- **Authentication**: WebSocket connections require authentication

### Message Types
- `booking_created`: New booking notification
- `booking_cancelled`: Booking cancellation notification
- `timeslot_created`: New time slot notification
- `timeslot_deleted`: Time slot deletion notification

### Connection Flow
1. **Authentication**: User must be logged in to connect
2. **Group Join**: User added to calendar_updates group
3. **Event Listening**: Real-time updates for all calendar events
4. **Automatic Reconnection**: Client reconnects on connection loss

## API Architecture

### RESTful Design
- **Resource-based URLs**: `/api/bookings/`, `/api/timeslots/`
- **HTTP Methods**: GET, POST, DELETE for operations
- **Status Codes**: Standard HTTP status codes
- **JSON Format**: All requests and responses in JSON

### Endpoint Categories
- **Authentication**: `/api/auth/` - Login, register, logout
- **User Operations**: `/api/user/` - User-specific data
- **Public Data**: `/api/categories/`, `/api/timeslots/`
- **Admin Operations**: `/api/admin/` - Admin-only endpoints
- **OAuth**: `/oauth/` - OAuth provider endpoints

## Database Schema

### Core Models
- **User**: Django built-in user model
- **Category**: Event categories (Cat 1, Cat 2, Cat 3)
- **TimeSlot**: Available time slots with categories
- **Booking**: User bookings for specific time slots
- **SocialAccount**: OAuth account information

### Relationships
- User ↔ Booking (One-to-Many)
- TimeSlot ↔ Booking (One-to-One)
- Category ↔ TimeSlot (One-to-Many)
- User ↔ TimeSlot (Creator, One-to-Many)

## Performance Optimizations

### Frontend
- **Lazy Loading**: Components loaded on demand
- **Change Detection**: Optimized Angular change detection
- **Caching**: Service-level caching for categories and user data
- **WebSocket Reconnection**: Automatic reconnection on failures

### Backend
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Database connection reuse
- **Middleware**: Custom middleware for admin checks
- **Static Files**: Nginx serves static files directly
