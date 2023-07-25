source .env.production
tar -czvf deploy.tar.gz .next public node_modules package.json next.config.js .env.production
scp deploy.tar.gz $DROPLET_USER@$DROPLET_IP:~/deploy.tar.gz
rm deploy.tar.gz
ssh $DROPLET_USER@$DROPLET_IP \
    "rm -rf code/deploy && mkdir code/another-notes-app && "\
    "tar -xzvf deploy.tar.gz -C code/another-notes-app && "\
    "rm deploy.tar.gz && "\
    "touch $DATABASE_URL && "\
    "cd code/another-notes-app && "\
    "PATH=/home/$DROPLET_USER/.nvm/versions/node/v17.7.1/bin:$PATH && "\
    "pm2 delete another-notes-app && "\
    "pm2 start \"next start -p 3035\" --name \"another-notes-app\""
