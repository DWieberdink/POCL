#!/bin/bash
# Azure App Service startup script
# This script ensures the Data directory exists and starts the app

# Create Data directory if it doesn't exist
mkdir -p /home/site/wwwroot/Data

# Start Gunicorn
gunicorn --bind 0.0.0.0:8000 --timeout 600 --workers 2 --access-logfile - --error-logfile - app:app

