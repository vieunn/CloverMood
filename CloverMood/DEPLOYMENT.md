# Deployment Instructions

## Environment Setup

### Development
- Copy `.env` to your local environment
- Update `VITE_API_BASE_URL` if your backend runs on a different port

### Production
- Set `VITE_API_BASE_URL` environment variable to your production API URL
- Example: `VITE_API_BASE_URL=https://api.clovermood.com/api`

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Deployment Checklist

- [x] Environment variables configured
- [x] API endpoints centralized
- [x] JWT tokens included in all authenticated requests
- [x] Build passes without errors
- [x] All hardcoded localhost URLs removed

## Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | `https://api.clovermood.com/api` |

## API Endpoints

All endpoints are now configurable via `VITE_API_BASE_URL`:

- Auth: `/auth/login`, `/auth/register`
- Profile: `/profile`, `/profile/password`, `/profile/photo`
- Moods: `/moods`, `/mood/check-in`
- Statistics: `/statistics/{userId}`
- Activity: `/activity-history/user/{userId}`
