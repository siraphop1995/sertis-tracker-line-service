const line = require('@line/bot-sdk');
const axios = require('axios');
const Line = require('../db').lineDocument;
const moment = require('moment-timezone');
const db = require('../utils/dbHandler');

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
    let rejectMessage = undefined;
    let isVerify = false;
    try {
      const userRes = await db.findUser(uid);
      if (!userRes) {
        rejectMessage = `Unknown eId: ${uid}`;
        agent.add(rejectMessage);
        return;
      }

      console.log(code);
      console.log(userRes);

      if (code == userRes.initCode) {
        await db.updateUser(userRes._id, data.source.userId);
        // axios.patch(`${USER_SERVER}/updateUser/${userRes._id}`, {
        //   lid: data.source.userId
        // });
        isVerify = true;
        agent.add('Account created successfully');
      } else {
        rejectMessage = `Incorrect init code for eID: ${uid}`;
        agent.add(rejectMessage);
      }
    } catch (err) {
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
          isVerify: isVerify,
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
    let rejectMessage = undefined;
    let newMessageVar = body.queryResult.parameters;

    try {
      agent.add(`${action} ${timePeriod} ${time} ${timeType}`);

      //Create a new message variable and if not input time, set default to 4

      if (action !== 'leave') {
        rejectMessage = 'Unknown format';
        return;
      }
      isVerify = true;
      if (time === '') {
        if (timePeriod === 'morning' || 'afternoon') {
          newMessageVar.time = 4;
        } else {
          newMessageVar.time = undefined;
          rejectMessage = 'Unknown time period';
        }
      }
      newMessageVar.time = parseInt(newMessageVar.time, 10);
    } catch (err) {
      rejectMessage = err.message;
      agent.add(`Error: ${err.message}`);
      next(err);
    } finally {
      const profile = await client.getProfile(data.source.userId);
      await saveHistory(
        _createFormatMoment(),
        {
          isVerify: isVerify,
          rejectMessage: rejectMessage,
          lid: data.source.userId,
          message: body.queryResult.queryText,
          messageIntent: 'leaveIntent',
          messageVar: newMessageVar,
          displayName: profile.displayName
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
    let rejectMessage = undefined;
    let newMessageVar = body.queryResult.parameters;

    try {
      agent.add(`absent ${action} ${time} ${timeType}`);

      isVerify = time === '' ? false : true;
      rejectMessage = time === '' ? 'Unknown time' : undefined;
      newMessageVar.time = parseInt(newMessageVar.time, 10);
    } catch (err) {
      rejectMessage = err.message;
      agent.add(`Error: ${err.message}`);
      next(err);
    } finally {
      const profile = await client.getProfile(data.source.userId);

      await saveHistory(
        _createFormatMoment(),
        {
          isVerify: isVerify,
          rejectMessage: rejectMessage,
          lid: data.source.userId,
          message: body.queryResult.queryText,
          messageIntent: 'absentIntent',
          messageVar: newMessageVar,
          displayName: profile.displayName
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
    const { body } = agent.request_;
    let { action, startDate, endDate } = body.queryResult.parameters;
    const { data } = body.originalDetectIntentRequest.payload;
    const profile = await client.getProfile(data.source.userId);
    let message = {
      isVerify: true,
      lid: data.source.userId,
      displayName: profile.displayName,
      rejectMessage: undefined,
      message: body.queryResult.queryText,
      messageIntent: 'longAbsentIntent',
      messageVar: body.queryResult.parameters
    };
    try {
      if (endDate) {
        const dateArr = _findDateInterval(startDate, endDate);

        agent.add(
          `long ${action} ${startDate} - ${endDate} duration:${dateArr.length}`
        );
        for (let i = 0; i < dateArr.length; i++) {
          await saveHistory(dateArr[i], message, agent, next);
        }
      } else {
        agent.add(`long ${action} ${startDate}`);
        await saveHistory(_createFormatMoment(startDate), message, agent, next);
      }
    } catch (err) {
      console.error(err);
      message.isVerify = false;
      message.rejectMessage = err.message;
      await saveHistory(_createFormatMoment(startDate), message, agent, next);
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

async function saveHistory(newDate, message, agent, next) {
  try {
    const { uid } = (
      await axios.get(`${USER_SERVER}/getEmployeeId/${message.lid}`)
    ).data;

    if (!uid) throw new Error('User not found');
    message.uid = uid;

    const users = (await axios.get(`${USER_SERVER}/getAllUsers`)).data.user;
    const r = Math.floor(Math.random() * users.length);
    message.uid = users[r].uid;
    message.lid = users[r].lid;
    message.uid = 'st011';

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
    agent.add(`Save to history failed. Error: ${err.message}`);
    next(err);
  }
}

function _createMoment(date) {
  if (!date) return moment().tz('Asia/Bangkok');
  else return moment(date).tz('Asia/Bangkok');
}

function _createFormatMoment(date) {
  if (!date)
    return moment()
      .tz('Asia/Bangkok')
      .format('DD/MM/YYYY');
  else
    return moment(date)
      .tz('Asia/Bangkok')
      .format('DD/MM/YYYY');
}

function _findDateInterval(startDate, endDate) {
  startDate = _createMoment(startDate);
  endDate = _createMoment(endDate);
  const duration = moment.duration(endDate.diff(startDate)).asDays();
  let dateArr = [];
  let date = startDate;
  for (let i = 0; i <= duration; i++) {
    dateArr.push(_createFormatMoment(date));
    date = date.add(1, 'days');
  }
  return dateArr;
}

module.exports = {
  defaultAction,
  initialize,
  checkLineId,
  leaveHandler,
  absentHandler,
  longAbsentHandler
};
