# Installation

## MongoDB
**install**
```
brew tap mongodb/brew
brew update
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
```
**stop**
brew services stop mongodb-community@8.0

**cli**
`mongosh`

## redis
**install**
```
brew ibstall redis
brew services start redis
```
**stop**
brew services stop redis

**cli**
`redis-cli`


## NodeJS
```
brew install node
npm install -g nodemon
```

# Run App
```
git clone https://github.com/giacomohuang/mpadmin.git
```
*client side*
```
cd mpadmin
npm install
npm run dev
```

*server side*
```
cd mpadmin/server
npm install
npm run dev
```