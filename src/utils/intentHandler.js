const line = require('@line/bot-sdk');
const axios = require('axios');
const Line = require('../db').lineDocument;
const moment = require('moment-timezone');

let config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};
const { USER_SERVER, DATE_SERVER } = process.env;

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
    const { uid, code } = body.queryResult.parameters;
    const { data } = body.originalDetectIntentRequest.payload;
    let status = 'unverify';
    let rejectMessage = undefined;
    try {
      const query = {
        uid: uid
      };
      const userRes = (await axios.post(`${USER_SERVER}/findUser`, query)).data;
      if (!userRes) {
        status = 'reject';
        rejectMessage = `Unknown eId: ${uid}`;
        agent.add(rejectMessage);
        return;
      }

      if (code == userRes.initCode) {
        await axios.patch(`${USER_SERVER}/updateUser/${userRes._id}`, {
          lid: data.source.userId
        });
        status = 'verify';
        agent.add('Account created successfully');
      } else {
        status = 'reject';
        rejectMessage = `Incorrect init code for eID: ${uid}`;
        agent.add(rejectMessage);
      }
    } catch (err) {
      status = 'reject';
      rejectMessage = err.message;
      //Check if error come from axios, if it does, convert it
      err = err.response ? err.response.data.error : err;
      if (err.code === 400) {
        const profile = await client.getProfile(data.source.userId);
        agent.add(profile.displayName + ' account is already initialize');
      } else {
        agent.add(`Error: ${err.message}`);
      }
      next(err);
    } finally {
      await saveHistory(
        {
          status: status,
          rejectMessage: rejectMessage,
          lid: data.source.userId,
          message: body.queryResult.queryText,
          messageIntent: 'initializeIntent'
        },
        agent,
        next
      );
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
      agent.add(`Error: ${err.message}`);
      next(err);
    }
  };
}

//Leave Intent handler
function leaveHandler(next) {
  return async agent => {
    console.log('leaveHandler');
    const { body } = agent.request_;
    const { action, timePeriod, time, timeType } = body.queryResult.parameters;
    const { data } = body.originalDetectIntentRequest.payload;
    let status = 'unverify';
    let rejectMessage = undefined;
    let newMessageVar = body.queryResult.parameters;

    try {
      agent.add(`${action} ${timePeriod} ${time} ${timeType}`);

      //Create a new message variable and if not input time, set default to 4

      if (action !== 'leave') {
        status = 'reject';
        rejectMessage = 'Unknown format';
        return;
      }
      status = 'verify';
      if (time === '') {
        if (timePeriod === 'morning' || 'afternoon') {
          newMessageVar.time = 4;
        } else {
          newMessageVar.time = undefined;
          status = 'reject';
          rejectMessage = 'Unknown time period';
        }
      }
      newMessageVar.time = parseInt(newMessageVar.time, 10);
    } catch (err) {
      status = 'reject';
      rejectMessage = err.message;
      agent.add(`Error: ${err.message}`);
      next(err);
    } finally {
      console.log('after');
      await saveHistory(
        {
          status: status,
          rejectMessage: rejectMessage,
          lid: data.source.userId,
          message: body.queryResult.queryText,
          messageIntent: 'leaveIntent',
          messageVar: newMessageVar
        },
        agent,
        next
      );
    }
  };
}

//Absent Intent handler
function absentHandler(next) {
  return async agent => {
    console.log('absentHandler');
    const { body } = agent.request_;
    const { action, time, timeType } = body.queryResult.parameters;
    const { data } = body.originalDetectIntentRequest.payload;
    let status = 'unverify';
    let rejectMessage = undefined;
    let newMessageVar = body.queryResult.parameters;

    console.log(newMessageVar)
    try {
      agent.add(`absent ${action} ${time} ${timeType}`);

      status = time === '' ? 'reject' : 'verify';
      rejectMessage = time === '' ? 'Unknown time' : undefined;
      newMessageVar.time = parseInt(newMessageVar.time, 10);
    } catch (err) {
      status = 'reject';
      rejectMessage = err.message;
      agent.add(`Error: ${err.message}`);
      next(err);
    } finally {
      await saveHistory(
        {
          status: status,
          rejectMessage: rejectMessage,
          lid: data.source.userId,
          message: body.queryResult.queryText,
          messageIntent: 'absentIntent',
          messageVar: newMessageVar
        },
        agent,
        next
      );
    }
  };
}

//Long Absent Intent handler
function longAbsentHandler(next) {
  return async agent => {
    console.log('longAbsentHandler');
    try {
      const { body } = agent.request_;
      let { action, startDate, endDate } = body.queryResult.parameters;
      const { data } = body.originalDetectIntentRequest.payload;
      console.log(body.queryResult.parameters);
      if (endDate) {
        agent.add(`${action} ${startDate} - ${endDate}`);
      } else {
        agent.add(`${action} ${startDate}`);
      }

      const message = {
        lid: data.source.userId,
        message: body.queryResult.queryText,
        messageIntent: 'longAbsentIntent',
        messageVar: body.queryResult.parameters
      };
      await saveHistory(message, agent, next);
    } catch (err) {
      agent.add(`Error: ${err.message}`);
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

async function saveHistory(message, agent, next) {
  try {
    const profile = await client.getProfile(message.lid);

    const { uid } = (await axios.get(
      `${USER_SERVER}/getEmployeeId/${message.lid}`
    )).data;

    if (!uid) throw new Error('User not found');
    message.displayName = profile.displayName;
    message.uid = uid;

    const users = (await axios.get(`${USER_SERVER}/getAllUsers`)).data;

    const r = Math.floor(Math.random() * users.length);
    message.uid = users[r].uid;
    message.lid = users[r].lid;

    let newDate = moment()
      .tz('Asia/Bangkok')
      .format('DD/MM/YYYY');

    newDate = '10/10/2019';
    console.log(newDate);
    const date = await Line.findOne({
      date: newDate
    });

    if (!date) {
      let newLine = new Line({
        date: newDate,
        history: []
      });
      newLine.history.push(message);
      await newLine.save();
    } else {
      await Line.findOneAndUpdate(
        { _id: date._id },
        {
          $push: {
            history: message
          }
        }
      );
    }
  } catch (err) {
    agent.add(`Error: ${err.message}`);
    next(err);
  }
}

module.exports = {
  defaultAction,
  initialize,
  checkLineId,
  leaveHandler,
  absentHandler,
  longAbsentHandler
};
