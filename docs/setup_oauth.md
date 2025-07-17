# 🔐 OAuth Integration Setup Guide

This guide explains how to configure **Google** and **GitHub OAuth** for the Event Booking Calendar application. OAuth allows users to log in using their Google or GitHub accounts.

---

## 🧭 Overview

- Supports **Google OAuth 2.0** and **GitHub OAuth**
- Requires credentials from the respective developer portals
- Uses `django-allauth` under the hood
- Redirects to `/oauth/<provider>/login/callback/` on backend

> ⚠️ OAuth is optional. You can use standard email/password login instead.

---

## 🧩 Prerequisites

- Application running locally at:
  - Frontend: `http://localhost:4200`
  - Backend: `http://localhost:8000`
- Django is configured with `django-allauth`
- Environment variables can be set in `.env`

---
## OAuth Setup Guide

### Google OAuth Configuration

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API" or "Google Identity API"

#### Step 2: Create OAuth Credentials
1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Select "Web application" as application type
4. Add authorized JavaScript origins:
   - http://localhost:4200 (for Angular dev server)
5. Add authorized redirect URIs:
   - http://localhost/oauth/google/login/callback/

#### Step 3: Configure Environment Variables
env
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret


### GitHub OAuth Configuration

#### Step 1: Create GitHub OAuth App
1. Go to GitHub Settings → "Developer settings" → "OAuth Apps"
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Your app name
   - **Homepage URL**: http://localhost:4200 (development)
   - **Authorization callback URL**: http://localhost/oauth/github/login/callback/

#### Step 2: Get Client Credentials
1. After creating the app, note the "Client ID"
2. Generate a "Client Secret"

#### Step 3: Configure Environment Variables
env
GITHUB_OAUTH_CLIENT_ID=your-github-client-id
GITHUB_OAUTH_CLIENT_SECRET=your-github-client-secret


### OAuth Callback URLs

For development:
- **Google**: http://localhost/oauth/google/login/callback/
- **GitHub**: http://localhost/oauth/github/login/callback/
