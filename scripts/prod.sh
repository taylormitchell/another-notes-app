usage() {
  echo "Usage: ./scripts/build.sh [options]"
  echo "Options:"
  echo "  --build-only: Only build the app"
  echo "  --run-only: Only run the app"
  echo "  --help: Show this help message"
  echo "  (default): Build and run the app"
}

build=false
run=false
deploy=false
for arg in "$@"; do
  if [ "$arg" == "--build" ]; then
    build=true
  elif [ "$arg" == "--run" ]; then
    run=true
  elif [ "$arg" == "--deploy" ]; then
    deploy=true
  elif [ "$arg" == "--help" ]; then
    usage
    exit 0
  else
    echo "Invalid argument: $arg"
    usage
    exit 1
  fi
done

# Build the app
if [ "$build" = true ]; then
  echo "Building the app..."
  cd client && npm run build && cd -
  cd server && npm run build && cd -
  echo "Copying files..."
  rm -rf dist && mkdir dist
  cp -r server/dist dist/dist
  cp server/package.json dist
  cp -r client/dist dist/static
  cp .env dist/.env
  echo "Updating .env file..."
  echo "CLIENT_DIR=../static" >> dist/.env
  echo "PORT=3001" >> dist/.env
fi

# Deploy the app
if [ "$deploy" = true ]; then
  echo "Deploying the app..."
  tar -czvf deploy.tar.gz -C dist .
  scp deploy.tar.gz $DROPLET_USER@$DROPLET_IP:~/deploy.tar.gz
  rm deploy.tar.gz
  ssh $DROPLET_USER@$DROPLET_IP \
      "rm -rf code/another-notes-app && mkdir code/another-notes-app && "\
      "tar -xzvf deploy.tar.gz -C code/another-notes-app --strip-components=1 && "\
      "rm deploy.tar.gz && "\
      "cd code/another-notes-app && "\
      "PATH=/home/$DROPLET_USER/.nvm/versions/node/v17.7.1/bin:$PATH && "\
      "npm install --omit=dev && "\
      "pm2 delete another-notes-app && "\
      "pm2 start \"npm start\" --name \"another-notes-app\""
fi

# Run the app
if [ "$run" = true ]; then
  cd dist
  npm install --omit=dev
  npm start
fi
  
