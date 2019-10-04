# Sertis Tracker Line Service (Prototype)

> A template to start using express

## <a name="contents"></a> Contents
 - [Dependencies](#dependencies)
 - [Prerequisite](#prerequisite)
 - [Installation](#installation)
 - [Usage](#usage)

## <a name="dependencies"></a> Dependencies
- [express](https://github.com/expressjs/express)
- [mongoose](https://github.com/Automattic/mongoose)
- [cors](https://github.com/expressjs/cors)
- [http-status](https://github.com/alexsasharegan/http-status)

## <a name="prerequisite"></a> Prerequisite

Docker mongo at port `27017`:  
```
docker run -d --name stt-mongo -p 27017:27017 mongo
```
PM2
```
npm install -g pm2
```

## <a name="installation"></a> Installation

Install dependencies
```
npm install --save
```

Used following local setting for `.env` file:  
```
PORT=7001
MONGO_URL=mongodb://localhost:27017/line
```
## <a name="usage"></a> Usage
Test server locally
```
npm start
```

Routes:

- `GET /webhook` - 
- `POST /webhook` - Use with dialogflow webhook
