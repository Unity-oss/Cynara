#!/usr/bin/env bash
# Build script for Render

set -o errexit  # Exit on error

# Navigate to Django project directory
cd Flicks

# Install dependencies
pip install -r ../requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Apply database migrations
python manage.py migrate