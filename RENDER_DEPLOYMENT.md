# Render Deployment Guide

## Overview
This guide explains how to deploy the CORE FastAPI backend to Render using the provided `render.yaml` configuration.

## Prerequisites
1. A Render account (https://render.com)
2. Your code pushed to a GitHub repository
3. Environment variables configured

## Deployment Steps

### 1. Push to GitHub
Ensure your code is pushed to GitHub with the `render.yaml` file in the root directory.

### 2. Create Blueprint on Render
1. Go to your Render dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select the branch containing `render.yaml` (usually `main`)
5. Give your blueprint a name (e.g., "CORE")
6. Click "Apply"

### 3. Configure Environment Variables
In your Render service settings, add these environment variables:

**Required:**
- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key
- `CORS_ORIGINS`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

**Optional:**
- `REDIS_URL`: If using Redis (Render can provide this)
- `LOGIC_MILL_TOKEN`: If using Logic Mill service
- `LOGIC_MILL_ENDPOINT`: Logic Mill API endpoint

### 4. Update Frontend Configuration
Once deployed, update your frontend API configuration to point to your Render backend URL:
```
https://your-service-name.onrender.com
```

### 5. Update CORS Settings
Replace the placeholder in `backend/app/main.py`:
```python
"https://your-vercel-app.vercel.app"  # Replace with your actual Vercel URL
```

## Service Configuration

The `render.yaml` configures:
- **Service Type**: Web service
- **Runtime**: Python 3.10
- **Build Command**: Install dependencies from requirements.txt
- **Start Command**: Run FastAPI with uvicorn
- **Health Check**: `/health` endpoint
- **Auto Deploy**: Enabled for automatic deployments

## Troubleshooting

### Build Failures
- Check that `requirements.txt` contains all necessary dependencies
- Verify Python version compatibility
- Check build logs in Render dashboard

### Runtime Errors
- Verify environment variables are set correctly
- Check service logs in Render dashboard
- Ensure health check endpoint is responding

### CORS Issues
- Verify frontend URL is added to CORS origins
- Check that CORS middleware is properly configured
- Test API endpoints directly

## Monitoring

- **Health Check**: Render automatically monitors `/health`
- **Logs**: Available in Render dashboard
- **Metrics**: CPU, memory usage in dashboard
- **Alerts**: Configure in Render settings

## Scaling

- **Plan Upgrade**: Upgrade from starter plan for more resources
- **Auto-scaling**: Available on higher plans
- **Database**: Add Redis or PostgreSQL services as needed

## Cost Optimization

- **Starter Plan**: Free tier with limitations
- **Sleep Mode**: Services sleep after inactivity on free tier
- **Monitoring**: Set up spending alerts

For more information, visit [Render Documentation](https://render.com/docs).