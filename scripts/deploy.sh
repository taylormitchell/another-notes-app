# maybe broken right now
source .env.production
tar -czvf deploy.tar.gz .next node_modules package.json .env.production
scp deploy.tar.gz $DROPLET_USER@$DROPLET_IP:~/deploy.tar.gz
rm deploy.tar.gz
ssh $DROPLET_USER@$DROPLET_IP \
    "rm -rf code/another-notes-app && mkdir code/another-notes-app && "\
    "tar -xzvf deploy.tar.gz -C code/another-notes-app && "\
    # "rm deploy.tar.gz && "\
    "cd code/another-notes-app && "\
    "PATH=/home/$DROPLET_USER/.nvm/versions/node/v17.7.1/bin:$PATH && "\
    "pm2 delete another-notes-app && "\
    "pm2 start \"next start -p 3001\" --name \"another-notes-app\""
