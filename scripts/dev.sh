#!/bin/bash
set -u
source .env
if [ "$VITE_IS_BACKEND_ENABLED" = "false" ]; then
  echo "Running frontend only"
  cd client && npm run dev
else
  echo "Running both frontend and backend"
  concurrently "cd server && npm run dev" "cd client && npm run dev"
fi
