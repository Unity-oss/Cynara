#!/bin/bash
cd Flicks
exec gunicorn Flicks.wsgi:application