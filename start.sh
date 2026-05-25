#!/bin/bash
set -e
cd api && php artisan serve --host=0.0.0.0 --port=$PORT
