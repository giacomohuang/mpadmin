# Installation

### MacOS 
## MongoDB
```
brew tap mongodb/brew
brew update
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
```

## NodeJS
```
brew install node
npm install -g nodemon
```

## Run App
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