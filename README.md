# Chronicler-bot
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)  
Discord bot to write audit of message update and deletion.  
Creates #audit channel and the post audit log there each time message is updated or deleted on a server.

## Table of Contents
- [Chronicler-bot](#chronicler-bot)
- [Existing commands](#existing-commands)
- [Want to use at your server?](#want-to-use-at-your-server)
- [If you found a bug](#if-you-found-a-bug)
- [Need any adjustments?](#need-any-adjustments)
- [Environment setup](#environment-setup)
- [Deployment manual](#deployment-manual)
  * [Set up Discord bot account](#set-up-discord-bot-account)
  * [Set up MongoDB Atlas](#set-up-mongodb-atlas)
  * [Set up Heroku](#set-up-heroku)

## Existing commands
List of available commands:
```
!help - show list of all commands in text channel
!ignore add channelId - ignore message update and delete in a text channel with the specified id. Example: !ignore add 717824008636334130
!ignore delete channelId - remove a text channel with the specified id from ignore list. Example: !ignore delete 717824008636334130
!about - get info about bot
```

*You can change command prefix ('!' by default) in your .env (PREFIX=! replace with PREFIX=your-sign')*


## Want to use at your server?
Currently the bot is deployed via Heroku and MongoDB Atlas for personal usage.  
You can use it via this link - https://discord.com/api/oauth2/authorize?client_id=715541575941357629&permissions=8&scope=bot  
In case bot will be shut down or set to be invite-only in future, you can deploy it yourself using [Deployment manual](#deployment-manual).

## If you found a bug
If you have any issue with the bot functionality, feel free to post an issue in this repo - for now, I am intended to maintain this app as long as I don't feel it is stable enough.

## Need any adjustments?
If you feel some really cool feature is missing, or you want to make some minor tweaks just for your own quality of life - feel free to either post an issue in the repo or make a fork and adjust it yourself as you see fit.

## Environment setup
1. Install NodeJS
2. Clone repo
3. Fetch all required npm packages using ```npm install```
4. Configure .env (use .env.sample as a reference if needed)
5. After any changes in code, in cmd call ```tsc```
6. Start the app by using ```nodemon build/main.js``` or debug it with your IDE

## Deployment manual
This bot was deployed by me using Heroku and MongoDB Atlas.

### Set up Discord bot account
1. Go to Discord Developer Portal
2. Click 'New Application', provide application name and click 'Create'
3. In the menu on left, go to the 'Bot' tab
4. Click 'Add Bot'
5. Copy Token from the created bot and save it in .env as TOKEN

### Set up MongoDB Atlas
1. Create MongoDB Atlas account
2. Add new Project
3. Build a Cluster
4. Choose a plan, region, cluster tier and cluster name
5. When your cluster is deployed, click on 'Connections'
6. Whitelist a connection IP address => Add a different IP Address => Add '0.0.0.0' to ensure Heroku is able to connect (Heroku uses dynamic IPs, so there's no way to whitelist just one IP)
7. Create a MongoDB User => Provide Username (save it in .env as MONGO_NAME) and Password (type or use autogenerate button; save it in .env as MONGO_PWD)
8. Click 'Choose connection method'
9. Choose 'Connect your application'
10. You'll be provided with a connection link. For example: ```mongodb+srv://<username>:<password>@cluster0-dxnlr.mongodb.net/test?retryWrites=true&w=majority```
11. Save part after '@' sign in .env as MONGO_CLUSTER. In this case, ```MONGO_CLUSTER=cluster0-dxnlr.mongodb.net/test?retryWrites=true&w=majority```

### Set up Heroku
1. Create a Heroku account
2. Create a New Pipeline
3. Connect Pipeline to the Github repository
4. Open pipeline
5. Add app to staging/production 
6. Open app
7. Go to the Settings tab
8. In Config Vars section, insert all configurations from .env file (except NODE_ENV, this one is provided by default)
9. Go to Deploy tab and ensure Automatic deploy is enabled for master branch
