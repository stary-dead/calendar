# Event Booking Calendar

A full-stack web application for booking events from pre-defined time slots with real-time updates and admin management capabilities.

## 🚀 Quick Start with Docker

## 🛠️ Tech Stack

### Frontend
- **Angular 20** - Modern web framework
- **Angular Material** - UI component library
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe JavaScript
- **WebSocket** - Real-time communication

### Backend
- **Django 4.2** - Python web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support
- **PostgreSQL** - Primary database
- **Redis** - WebSocket backend and caching
- **django-allauth** - OAuth integration

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and static files
- **Environment Variables** - Configuration management

## 🚀 Featureser

The easiest way to run the application is using Docker Compose:

### Prerequisites
- Docker and Docker Compose installed
- Git for cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calendar
   ```
2.  **OAuth Setup (Optional)**
    To enable OAuth login:

    1. **Google OAuth**:
    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project or select existing
    - Enable Google+ API
    - Create OAuth 2.0 credentials
    - Add `http://localhost/oauth/google/login/callback/` to redirect URIs

    2. **GitHub OAuth**:
    - Go to GitHub Settings > Developer settings > OAuth Apps
    - Create new OAuth App
    - Set Authorization callback URL to `http://localhost/oauth/github/login/callback/`

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings (database credentials, OAuth keys, etc.)

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost/api/
   - Admin Panel: http://localhost/admin/

## ⭐ Beyond Requirements

This implementation goes beyond the basic task requirements with additional features for production-ready deployment:

### 🐳 **Docker Containerization**
- **Why**: Simplified deployment and consistent environment across development/production
- **What**: Complete multi-container setup with PostgreSQL, Redis, Django, Angular, and Nginx
- **Benefit**: One-command deployment, no dependency conflicts, easy scaling

### 🔄 **Real-time Updates (WebSocket)**
- **Why**: Enhanced user experience with instant calendar updates
- **What**: Django Channels integration with Redis backend for WebSocket communication
- **Benefit**: Users see bookings/cancellations immediately without page refresh

### 🔐 **OAuth Integration**
- **Why**: Modern authentication options and improved user experience
- **What**: Google and GitHub OAuth alongside traditional login/register
- **Benefit**: Reduced friction for user registration, secure authentication

## 📁 Project Structurent Booking Calendar

A full-stack web application for booking events from pre-defined time slots with real-time updates and admin management capabilities.

## � Project Structure

### 🐍 Backend (Django)
```
backend/
├── calendar_project/     # Core Django settings & configuration
│   ├── settings.py       # Django settings with OAuth & WebSocket config
│   ├── urls.py          # Main URL routing
│   ├── asgi.py          # ASGI configuration for WebSocket
│   └── wsgi.py          # WSGI configuration for HTTP
├── bookings/            # Booking management module
│   ├── models.py        # Booking data model
│   ├── consumers.py     # WebSocket consumers for real-time updates
│   ├── websocket_utils.py # WebSocket event broadcasting
│   └── admin.py         # Django admin configuration
├── events/              # Event & time slot management
│   ├── models.py        # Category & TimeSlot models
│   ├── admin.py         # Admin interface for events
│   └── migrations/      # Database migrations
├── users/               # User management & authentication
│   ├── auth_views.py    # Login/register/logout endpoints
│   ├── oauth_views.py   # OAuth (Google/GitHub) integration
│   ├── admin_views.py   # Admin-only API endpoints
│   ├── user_views.py    # User API endpoints
│   ├── serializers.py   # DRF serializers
│   ├── middleware.py    # Custom middleware
│   └── adapters.py      # OAuth adapters
├── tests/               # Comprehensive test suite
│   ├── base.py          # Base test classes
│   ├── test_admin_endpoints.py # Admin API tests
│   └── test_user_endpoints.py  # User API tests
├── media/               # User-uploaded media files
├── staticfiles/         # Collected static files
├── requirements.txt     # Python dependencies
└── manage.py           # Django management script
```

### 🅰️ Frontend (Angular)
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/    # UI Components
│   │   │   ├── admin/     # Admin panel components
│   │   │   │   └── bookings/  # Admin booking overview
│   │   │   ├── auth/      # Authentication components
│   │   │   │   ├── login/     # Login form with OAuth
│   │   │   │   ├── register/  # Registration form
│   │   │   │   └── oauth-callback/ # OAuth callback handler
│   │   │   ├── calendar/  # Main calendar interface
│   │   │   │   ├── calendar.component.ts   # Calendar logic
│   │   │   │   ├── calendar.component.html # Calendar template
│   │   │   │   └── calendar.component.scss # Calendar styles
│   │   │   ├── shared/    # Reusable components
│   │   │   │   ├── category-filter/    # Category selection
│   │   │   │   ├── confirm-dialog/     # Confirmation dialogs
│   │   │   │   ├── error-message/      # Error handling
│   │   │   │   ├── loading-spinner/    # Loading indicators
│   │   │   │   └── admin-slot-form/    # Admin slot creation
│   │   │   └── layout/    # App layout components
│   │   │       ├── header/    # Navigation header
│   │   │       └── sidebar/   # Navigation sidebar
│   │   ├── services/      # Business logic services
│   │   │   ├── auth.service.ts        # Authentication service
│   │   │   ├── social-auth.service.ts # OAuth integration
│   │   │   ├── booking.service.ts     # Booking management
│   │   │   ├── websocket.service.ts   # WebSocket communication
│   │   │   ├── api.service.ts         # HTTP API calls
│   │   │   └── csrf.service.ts        # CSRF token handling
│   │   ├── guards/        # Route protection
│   │   │   ├── auth.guard.ts   # Authentication guard
│   │   │   └── admin.guard.ts  # Admin access guard
│   │   ├── models/        # TypeScript interfaces
│   │   │   ├── user.model.ts      # User data structure
│   │   │   ├── booking.model.ts   # Booking data structure
│   │   │   └── category.model.ts  # Category data structure
│   │   ├── material.module.ts # Angular Material imports
│   │   └── app.routes.ts     # Application routing
│   ├── environments/      # Environment configurations
│   │   ├── environment.ts     # Development config
│   │   └── environment.prod.ts # Production config
│   ├── styles.scss       # Global styles
│   └── index.html        # Main HTML template
├── angular.json          # Angular CLI configuration
├── package.json         # Node.js dependencies
└── tsconfig.json        # TypeScript configuration
```

### 🐳 Infrastructure
```
├── docker-compose.yml    # Multi-container orchestration
├── nginx/               # Reverse proxy configuration
│   ├── Dockerfile       # Nginx container setup
│   └── nginx.conf       # Proxy & static file serving
├── .env.example         # Environment variables template
└── README.md           # Project documentation
```

## �🚀 Features

### User Features
- **Authentication**: Regular login/register and OAuth integration (Google, GitHub)
- **Calendar View**: Weekly calendar display with time slots
- **Event Categories**: Filter events by categories (Cat 1, Cat 2, Cat 3)
- **Booking Management**: Book available time slots and cancel your bookings
- **Real-time Updates**: WebSocket integration for instant calendar updates

### Admin Features
- **Time Slot Management**: Create, view, and delete time slots
- **Booking Overview**: View all user bookings with detailed information
- **Admin Controls**: Cancel any booking and delete time slots (including booked ones)
- **User Management**: Monitor booking activity across all users

### Technical Features
- **Real-time Communication**: WebSocket support for live updates
- **Responsive Design**: Mobile-friendly interface using Angular Material
- **Docker Support**: Complete containerization for easy deployment
- **API Documentation**: RESTful API with comprehensive endpoints
- **Authentication Security**: Session-based auth with CSRF protection

## 🛠️ Tech Stack

### Frontend
- **Angular 20** - Modern web framework
- **Angular Material** - UI component library
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe JavaScript
- **WebSocket** - Real-time communication

### Backend
- **Django 4.2** - Python web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support
- **PostgreSQL** - Primary database
- **Redis** - WebSocket backend and caching
- **django-allauth** - OAuth integration

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and static files
- **Environment Variables** - Configuration management



## 🔧 Configuration

### Environment Variables
Key environment variables in `.env`:

```env
# Database
POSTGRES_DB=calendar_db
POSTGRES_USER=calendar_user
POSTGRES_PASSWORD=your_password

# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# OAuth (Optional)
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GITHUB_OAUTH_CLIENT_ID=your-github-client-id
GITHUB_OAUTH_CLIENT_SECRET=your-github-client-secret
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/register/` - User registration
- `GET /api/auth/user/` - Current user info

### User Endpoints
- `GET /api/categories/` - List event categories
- `GET /api/timeslots/` - List time slots (with filtering)
- `POST /api/bookings/` - Create booking
- `DELETE /api/bookings/{id}/` - Cancel booking
- `GET /api/user/bookings/` - User's bookings

### Admin Endpoints
- `GET /api/admin/timeslots/` - List all time slots
- `POST /api/admin/timeslots/` - Create time slot
- `DELETE /api/admin/timeslots/{id}/` - Delete time slot
- `GET /api/admin/bookings/` - List all bookings
- `DELETE /api/admin/bookings/{id}/` - Cancel any booking

### OAuth Endpoints
- `GET /oauth/google/login/` - Google OAuth login
- `GET /oauth/github/login/` - GitHub OAuth login

## 🔄 WebSocket Events

Real-time events broadcasted to all connected clients:
- `booking_created` - New booking created
- `booking_cancelled` - Booking cancelled
- `timeslot_created` - New time slot created
- `timeslot_deleted` - Time slot deleted

## 📱 Usage

### For Users
1. Register an account or use OAuth login
2. Select event categories you're interested in
3. Navigate through weekly calendar view
4. Click on available time slots to book
5. Click on your bookings to cancel them

### For Admins
1. Log in with admin credentials
2. Create new time slots using the admin form
3. View all bookings in the calendar tooltips
4. Right-click on time slots for admin actions
5. Cancel bookings or delete time slots as needed

## 📊 Database Schema

### Core Models
- **User**: Django's built-in user model
- **Category**: Event categories (Cat 1, Cat 2, Cat 3)
- **TimeSlot**: Time slots with start/end times
- **Booking**: User bookings for time slots
- **SocialAccount**: OAuth account information

### Key Relationships
- User → Booking (One-to-Many)
- TimeSlot → Booking (One-to-One)
- Category → TimeSlot (One-to-Many)
- User → TimeSlot (created_by, One-to-Many)

## 🐳 Docker Services

The application consists of 5 Docker services:

1. **PostgreSQL** (`db`) - Database server
2. **Redis** (`redis`) - WebSocket backend
3. **Django Backend** (`backend`) - API server
4. **Angular Frontend** (`frontend`) - Web interface
5. **Nginx** (`nginx`) - Reverse proxy

## 🔐 Security Features

- CSRF protection for all API endpoints
- Session-based authentication
- OAuth integration with secure token handling
- Input validation and sanitization
- SQL injection prevention through Django ORM
- XSS protection with Angular sanitization

## 📈 Performance

- Database indexing for optimal query performance
- WebSocket connection pooling
- Static file serving through Nginx
- Connection pooling for database
- Optimized Angular build for production


## 🏗️ Architecture

The application follows a modern microservices architecture:
- Frontend and backend are completely decoupled
- RESTful API design with consistent endpoints
- WebSocket layer for real-time features
- Database layer with proper normalization
- Containerized deployment for scalability

## 📄 License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).

**Important**: This software is **NOT** licensed for commercial use. You are free to:
- Use, copy, and distribute the software for non-commercial purposes
- Modify and create derivative works for personal or educational use
- Share the software with proper attribution

**Commercial use is strictly prohibited** without explicit written permission from the copyright holder.

For commercial licensing inquiries, please contact the project maintainer.

See the [LICENSE](LICENSE) file for the complete license terms.

---

**Note**: This is a demonstration project showcasing modern web development practices and real-time application features.
