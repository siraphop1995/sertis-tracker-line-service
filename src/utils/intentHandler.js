const line = require('@line/bot-sdk');
const axios = require('axios');

let config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};
const { USER_SERVER } = process.env;

const client = new line.Client(config);

//Default Fall Back Intent handler
function defaultAction(next) {
  return async agent => {
    console.log('defaultAction');
    const { body } = agent.request_;
    const { fulfillmentText, queryText } = body.queryResult;
    const { data } = body.originalDetectIntentRequest.payload;
    try {
      switch (queryText.toLowerCase()) {
        case 'bye':
          agent.add('bye');
          switch (data.source.type) {
            case 'user':
              return replyText(
                data.replyToken,
                "Bot can't leave from 1:1 chat"
              );
            case 'group':
              return replyText(data.replyToken, 'Leaving group').then(() => {
                client.leaveGroup(data.source.groupId);
              });
            case 'room':
              return replyText(data.replyToken, 'Leaving group').then(() => {
                client.leaveRoom(data.source.roomId);
              });
          }
        default:
          return agent.add(fulfillmentText);
      }
    } catch (err) {
      agent.add(err.message);
      next(err);
    }
  };
}

//Initialize Intent handler
function initialize(next) {
  return async agent => {
    console.log('initialize');
    const { body } = agent.request_;
    const { data } = body.originalDetectIntentRequest.payload;
    try {
      let newUser = {
        lineId: data.source.userId,
        employeeId: '123456',
        firstName: 'Siraphop',
        lastName: 'Amo',
        nickName: 'Champ'
      };

      const newRes = await axios.post(USER_SERVER + '/user', newUser);
      console.log(newRes.data);

      agent.add('Account created successfully');
    } catch (err) {
      //Check if error come from axios, if it does, convert it
      err = err.response ? err.response.data.error : err;

      if (err.code === 400) {
        const profile = await client.getProfile(data.source.userId);
        agent.add(profile.displayName + ' account is already initialize');
      } else {
        agent.add(err.message);
      }
      next(err);
    }
  };
}

//Check ID Intent handler
function checkLineId(next) {
  return async agent => {
    console.log('checkLineId');
    const { body } = agent.request_;
    const { data } = body.originalDetectIntentRequest.payload;
    try {
      agent.add('LINE ID: ' + data.source.userId);
    } catch (err) {
      agent.add(err.message);
      next(err);
    }
  };
}

//Leave Intent handler
function leaveHandler(next) {
  return async agent => {
    console.log('leaveHandler');
    try {
      const { body } = agent.request_;
      const {
        action,
        timePeriod,
        time,
        timeType,
        particle
      } = body.queryResult.parameters;
      console.log(body.queryResult.parameters);
      console.log(action, timePeriod, particle);
      agent.add(`${action} ${timePeriod} ${time} ${timeType} ${particle}`);
      if (timePeriod === 'morning') {
      } else if (timePeriod === 'afternoon') {
      }
    } catch (err) {
      agent.add(err.message);
      next(err);
    }
  };
}

//Absent Intent handler
function absentHandler(next) {
  return async agent => {
    console.log('absentHandler');
    try {
      agent.add('absentHandler');
    } catch (err) {
      agent.add(err.message);
      next(err);
    }
  };
}

function replyText(token, texts) {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map(text => ({ type: 'text', text }))
  );
}

module.exports = {
  defaultAction,
  initialize,
  checkLineId,
  leaveHandler
};
