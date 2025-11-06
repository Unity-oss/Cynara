#!/usr/bin/env bash
# Build script for Render

set -o errexit  # Exit on error

# Install dependencies
pip install -r requirements.txt

# Navigate to Django project directory
cd Flicks

# Collect static files
python manage.py collectstatic --noinput

# Apply database migrations
python manage.py migrate