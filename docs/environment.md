# Environment Variables

## Overview

The application uses environment variables for configuration. Create a `.env` file in the root directory based on `.env.example`.

## Required Environment Variables

### Django Core Settings

#### SECRET_KEY
- **Description**: Secret key for Django security features
- **Required**: Yes
- **Example**: `SECRET_KEY=your-very-long-and-secure-secret-key-here`
- **Security**: Must be unique and kept secret in production

#### DEBUG
- **Description**: Enable/disable debug mode
- **Required**: Yes
- **Values**: `1` (true) or `0` (false)
- **Example**: `DEBUG=1`
- **Production**: Set to `0` in production

#### ALLOWED_HOSTS
- **Description**: Comma-separated list of allowed hosts
- **Required**: Yes
- **Example**: `ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com`
- **Production**: Add your domain names

### Database Configuration

#### POSTGRES_DB
- **Description**: PostgreSQL database name
- **Required**: Yes
- **Example**: `POSTGRES_DB=calendar_db`

#### POSTGRES_USER
- **Description**: PostgreSQL username
- **Required**: Yes
- **Example**: `POSTGRES_USER=calendar_user`

#### POSTGRES_PASSWORD
- **Description**: PostgreSQL password
- **Required**: Yes
- **Example**: `POSTGRES_PASSWORD=your_secure_password_here`
- **Security**: Use strong password in production

#### DB_HOST
- **Description**: Database host
- **Required**: Yes
- **Example**: `DB_HOST=db` (Docker) or `DB_HOST=localhost`

#### DB_PORT
- **Description**: Database port
- **Required**: Yes
- **Example**: `DB_PORT=5432`

### Redis Configuration

#### REDIS_URL
- **Description**: Redis connection URL for WebSocket backend
- **Required**: Yes
- **Example**: `REDIS_URL=redis://redis:6379/0`

### CORS Configuration

#### CORS_ALLOWED_ORIGINS
- **Description**: Comma-separated list of allowed frontend origins
- **Required**: Yes
- **Example**: `CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost`
- **Production**: Add your frontend domain

### Admin User Creation

#### CREATE_DEFAULT_SUPERUSER
- **Description**: Create default admin user on startup
- **Required**: No
- **Values**: `true` or `false`
- **Example**: `CREATE_DEFAULT_SUPERUSER=true`

#### DEFAULT_SUPERUSER_USERNAME
- **Description**: Default admin username
- **Required**: If CREATE_DEFAULT_SUPERUSER=true
- **Example**: `DEFAULT_SUPERUSER_USERNAME=admin`

#### DEFAULT_SUPERUSER_PASSWORD
- **Description**: Default admin password
- **Required**: If CREATE_DEFAULT_SUPERUSER=true
- **Example**: `DEFAULT_SUPERUSER_PASSWORD=your_secure_admin_password`

#### DEFAULT_SUPERUSER_EMAIL
- **Description**: Default admin email
- **Required**: If CREATE_DEFAULT_SUPERUSER=true
- **Example**: `DEFAULT_SUPERUSER_EMAIL=admin@example.com`

### OAuth Configuration (Optional)

#### GOOGLE_OAUTH_CLIENT_ID
- **Description**: Google OAuth client ID
- **Required**: No (for Google OAuth)
- **Example**: `GOOGLE_OAUTH_CLIENT_ID=your-google-client-id`

#### GOOGLE_OAUTH_CLIENT_SECRET
- **Description**: Google OAuth client secret
- **Required**: No (for Google OAuth)
- **Example**: `GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret`

#### GITHUB_OAUTH_CLIENT_ID
- **Description**: GitHub OAuth client ID
- **Required**: No (for GitHub OAuth)
- **Example**: `GITHUB_OAUTH_CLIENT_ID=your-github-client-id`

#### GITHUB_OAUTH_CLIENT_SECRET
- **Description**: GitHub OAuth client secret
- **Required**: No (for GitHub OAuth)
- **Example**: `GITHUB_OAUTH_CLIENT_SECRET=your-github-client-secret`

## Environment File Template

Create `.env` file in project root:

```env
# Django settings
SECRET_KEY=your-very-long-and-secure-secret-key-here
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1,testserver,backend

# Database settings
POSTGRES_DB=calendar_db
POSTGRES_USER=calendar_user
POSTGRES_PASSWORD=your_secure_password_here
DB_HOST=db
DB_PORT=5432

# Redis settings
REDIS_URL=redis://redis:6379/0

# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost

# Superuser creation flag
CREATE_DEFAULT_SUPERUSER=true

# Default superuser credentials (only used if CREATE_DEFAULT_SUPERUSER=true)
DEFAULT_SUPERUSER_USERNAME=admin
DEFAULT_SUPERUSER_PASSWORD=your_secure_admin_password
DEFAULT_SUPERUSER_EMAIL=admin@example.com

# OAuth Settings (fill with your data)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
```

## Security Notes

### Production Environment
- Generate a new, unique `SECRET_KEY`
- Set `DEBUG=0`
- Use strong database passwords
- Enable HTTPS and update OAuth redirect URLs
- Restrict `ALLOWED_HOSTS` to your domain only
- Store sensitive variables securely (not in version control)

### Development Environment
- Keep `DEBUG=1` for development
- Use `localhost` domains for OAuth testing
- Default credentials are for development only

## Troubleshooting

### OAuth Issues
- **"redirect_uri_mismatch"**: Check callback URLs in OAuth provider settings
- **"invalid_client"**: Verify client ID and secret are correct
- **"access_denied"**: Check OAuth app permissions and scopes

### Database Connection
- Ensure PostgreSQL is running
- Check database credentials
- Verify network connectivity (Docker networks)

### Redis Connection
- Ensure Redis is running
- Check Redis URL format
- Verify Redis is accessible from Django container

## Testing OAuth Configuration

After configuring OAuth:

1. Start the application
2. Navigate to login page
3. Click "Login with Google" or "Login with GitHub"
4. Check `/api/oauth/status/` endpoint for provider availability
5. Monitor Django logs for OAuth-related errors
