# Installation

## MongoDB

**install**

```
brew tap mongodb/brew
brew update
brew install mongodb-community
brew services start mongodb-community
```

**stop**
brew services stop mongodb-community

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

## Minio

**install**

```
brew install minio/stable/minio
minio server ~/minio_data
```

# Run App

```

git clone https://github.com/giacomohuang/mpadmin.git

```

**client side**

```

cd mpadmin
npm install
npm run dev

```

**server side**

```

cd mpadmin/server
npm install
npm run dev

```

```

```

# VSCode
