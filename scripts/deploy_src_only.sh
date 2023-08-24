# maybe broken right now

# Build the project on your local machine

# npm run build

# Compress only the .next folder
tar -czvf deploy.tar.gz .next

# Copy the compressed file to the server
scp deploy.tar.gz $DROPLET_USER@$DROPLET_IP:~/deploy.tar.gz

# SSH into the server
ssh $DROPLET_USER@$DROPLET_IP \
    "rm -rf code/another-notes-app/.next && mkdir -p code/another-notes-app && "\
    "tar -xzvf deploy.tar.gz -C code/another-notes-app && "\
    "rm deploy.tar.gz && "\
    "cd code/another-notes-app && "\
    "PATH=/home/$DROPLET_USER/.nvm/versions/node/v17.7.1/bin:$PATH && "\
    # "pm2 delete another-notes-app && "\
    "pm2 start \"next start -p 3001\" --name \"another-notes-app\""
