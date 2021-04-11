[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

## Architecture

This app structure is inspired by the blog post ['Bulletproof node.js project architecture'](https://softwareontheroad.com/ideal-nodejs-project-structure?utm_source=github&utm_medium=readme)

Please read the blog post in order to have a good understanding of the server architecture.

## Setup

### Node

We use `node` version 14 and `npm` version 7

```
nvm install 14
nvm use 14
npm i npm@7 -g
```

### Install packages

After cloning the repo or pulling new changes, be sure to install the node_modules by running:

```
npm install --force
```

### Let's go

Now you are ready to start the server.

## Start

```
npm run start
```

It uses nodemon for live-reloading

When the app is started, it should be available on http://localhost:4000

## Commit conventions

We use Conventional Commits specification. Please commit your messages using `git cz` command. You can install it using command `npm i -g commitizen`.
It will ask you more questions than just a commit, which allows to create a beautiful CHANGELOG.md

