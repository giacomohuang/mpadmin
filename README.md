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

### access policy

- 设置访问策略：允许直接从URL下载文件

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::mpadmin", "arn:aws:s3:::mpadmin/*"]
    },
    {
      "Effect": "Deny",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:DeleteBucketPolicy", "s3:DeleteObject", "s3:PutBucketPolicy", "s3:PutLifecycleConfiguration", "s3:PutObject"],
      "Resource": ["arn:aws:s3:::mpadmin", "arn:aws:s3:::mpadmin/*"]
    }
  ]
}
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
