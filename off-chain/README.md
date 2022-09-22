# Digible OffChain API

This private repo contains all the back end code for the off-chain API which supports all actions which occur NOT on the blockchain. This server runs 2 services: IPFS node for image/video file storage + express JS API.

 - express JS API -> /opt/apis/off-chain/ -> Managed  with PM2 -> synced from this git repo
 - IPFS node -> built from npm package

Note: API uses .env file for config - this API generates SMTP emails from no-reply@digible.io for physical claims. This uses smtp from AWS (serge@digible.io) account). This generates an email to the user as well as to admin@digible.io to notify about pending claims requested. 

Admin manual for web UI : https://github.com/Digible/DigibleUI/blob/auctions_v2/README.md


## Installation

```bash
$ npm install
```

Setup env variables.

```bash
$ cp .env.example .env
```

And edit with your params.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Upgrading API

```bash
$ cd /opt/apis/off-chain
$ git pull
$ npm install 
$ rm -rf dist/
$ npm run-script build
$ pm2 restart 0
```

## IPFS node:

```bash
# check status
$ systemctl status ipfs 

# start ipfs (typically runs on its own)
$ systemctl start ipfs 
```
