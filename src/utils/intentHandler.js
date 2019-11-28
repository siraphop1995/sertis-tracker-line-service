/**
 * Intent Handler to handle different dialogflow intent
 */

const line = require('@line/bot-sdk');
const Line = require('../db').lineDocument;
const moment = require('moment-timezone');
const db = require('../utils/dbHandler');

let config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

/**
 * Default Fallback Intent handler.
 *
 * Any intent that does not fall into other.
 * intent will come here
 */
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
          return agent.add('defaultIntent: message of unknown type');
      }
    } catch (err) {
      agent.add(`Error: ${err.message}`);
      next(err);
    }
  };
}

/**
 * Initialize Intent handler.
 *
 * Handle init command and update user lineId to database.
 * User must use correct initCode
 */
function initialize(next) {
  return async agent => {
    console.log('initialize');
    const { body } = agent.request_;
    const { uid, code } = body.queryResult.parameters;
    const { data } = body.originalDetectIntentRequest.payload;
    let rejectMessage = undefined;
    let isVerify = true;
    try {
      const userRes = await db.findUser(uid);
      if (!userRes) throw new Error(`uid: {${uid}} not found`);
      if (code != userRes.initCode)
        throw new Error(`incorrect init code for uid {${uid}}`);

      await db.updateUser(userRes._id, data.source.userId);
      agent.add('Account created successfully');
    } catch (err) {
      //Check if error come from axios, if it does, convert it
      err = err.response ? err.response.data.error : err;
      isVerify = false;
      if (err.code === 400) {
        const profile = await client.getProfile(data.source.userId);
        rejectMessage = profile.displayName + ' account is already initialize';
      } else {
        rejectMessage = err.message;
      }
      agent.add(`Error: ${rejectMessage}`);
      next(err);
    } finally {
      await saveHistory(
        _createMomentDate(),
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

/**
 * Leave Intent handler.
 *
 * Handle leave less than one day.
 * Will save all line message regardless of
 * valid status
 */
function leaveHandler(next) {
  return async agent => {
    console.log('leaveHandler');
    const { body } = agent.request_;
    const {
      specialIndicator,
      action,
      timePeriod,
      time,
      timeType
    } = body.queryResult.parameters;
    const { data } = body.originalDetectIntentRequest.payload;
    let isVerify = true;
    let rejectMessage = undefined;
    let newMessageVar = body.queryResult.parameters;
    try {
      agent.add(
        `leaveIntent: ${specialIndicator} ${action} ${timePeriod} ${time} ${timeType}`
      );
      if (action !== 'leave') throw new Error('not leaveIntent');
      if (action !== 'leave') throw new Error('unknown format');
      if (time === '') {
        if (timePeriod === 'morning' || timePeriod === 'afternoon') {
          newMessageVar.time = 4;
        } else {
          throw new Error('unknown time period');
        }
      }
      newMessageVar.time = parseInt(newMessageVar.time, 10);
    } catch (err) {
      isVerify = false;
      rejectMessage = err.message;
      agent.add(`Error: ${rejectMessage}`);
      next(err);
    } finally {
      await saveHistory(
        _createMomentDate(specialIndicator),
        {
          isVerify: isVerify,
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

/**
 * Absent Intent handler.
 *
 * Handle one day absent.
 * Will save all line message regardless of
 * valid status
 */
function absentHandler(next) {
  return async agent => {
    console.log('absentHandler');
    const { body } = agent.request_;
    const {
      specialIndicator,
      action,
      time,
      timeType
    } = body.queryResult.parameters;
    const { data } = body.originalDetectIntentRequest.payload;
    let isVerify = true;
    let rejectMessage = undefined;
    let newMessageVar = body.queryResult.parameters;
    try {
      if (action !== 'leave') throw new Error('not absentIntent');

      agent.add(
        `absentIntent: ${specialIndicator} ${action} ${time} ${timeType}`
      );

      if (time === '') throw new Error('unknown time');
      newMessageVar.time = parseInt(newMessageVar.time, 10);
    } catch (err) {
      isVerify = false;
      rejectMessage = err.message;
      agent.add(`Error: ${rejectMessage}`);
      next(err);
    } finally {
      await saveHistory(
        _createMomentDate(specialIndicator),
        {
          isVerify: isVerify,
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

/**
 * Long Absent Intent handler.
 *
 * Handle absent of one or more than one day.
 * Will save all line message regardless of
 * valid status
 */
function longAbsentHandler(next) {
  return async agent => {
    console.log('longAbsentHandler');
    const { body } = agent.request_;
    let { action, startDate, endDate } = body.queryResult.parameters;
    const { data } = body.originalDetectIntentRequest.payload;
    let message = {
      isVerify: true,
      lid: data.source.userId,
      rejectMessage: undefined,
      message: body.queryResult.queryText,
      messageIntent: 'longAbsentIntent',
      messageVar: body.queryResult.parameters
    };
    try {
      if (action !== 'leave') throw new Error('not longAbsentIntent');
      if (!endDate) {
        if (!startDate) throw new Error('not longAbsentIntent');
        agent.add(`longAbsentIntent: ${action} ${startDate}`);
        await saveHistory(_createFormatMoment(startDate), message, agent, next);
      } else {
        const dateArr = _findDateInterval(startDate, endDate);
        agent.add(
          `longAbsentIntent: ${action} ${startDate} - ${endDate} duration: ${dateArr.length} days`
        );
        for (let i = 0; i < dateArr.length; i++) {
          await saveHistory(dateArr[i], message, agent, next);
        }
      }
    } catch (err) {
      message.isVerify = false;
      message.rejectMessage = err.message;
      await saveHistory(_createFormatMoment(startDate), message, agent, next);
      agent.add(`Error: ${message.rejectMessage}`);
      next(err);
    }
  };
}

/**
 * Function to simplify line replyMessage
 * @param     {string} replyToken - replyToken
 * @param     {string} text - replyText
 * @example   replyText(replyToken, 'text')
 */
function replyText(token, texts) {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map(text => ({ type: 'text', text }))
  );
}

/**
 * Function to save line message to daily history
 * @param     {string} newDate - date to save history to
 * @param     {Object} message - message object to save
 * @param     {Object} agent - dialogflow agent
 * @param     {Object} next - express next
 * @example   replyText(replyToken, 'text')
 */
async function saveHistory(newDate, message, agent, next) {
  try {
    console.log('saving to history');
    const uid = await db.getEmployeeId(message.lid);

    if (!uid) throw new Error('User not found');
    message.uid = uid;

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

/**
 * Function to change date according to type
 * @param     {string} type - type from dialogflow
 * @return    {Date} date - moment date
 * @example   _createMomentDate('tomorrow')
 */
function _createMomentDate(type) {
  let date = undefined;
  switch (type) {
    case 'tomorrow':
      date = moment()
        .add(1, 'days')
        .tz('Asia/Bangkok');
      break;
    case 'yesterday':
      date = moment()
        .subtract(1, 'days')
        .tz('Asia/Bangkok');
      break;
    default:
      date = moment().tz('Asia/Bangkok');
  }
  return _createFormatMoment(date);
}

/**
 * Create a moment date from date string
 * @param     {string} date - date to create
 * @returns   {Date} moment date
 * @example    _createMoment('10/10/2019')
 */
function _createMoment(date) {
  if (!date) return moment().tz('Asia/Bangkok');
  else return moment(date).tz('Asia/Bangkok');
}

/**
 * Create a moment date(format) from date string
 * @param     {string} date - date to create
 * @returns   {Date} moment date
 * @example    _createFormatMoment('10/10/2019')
 */
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

/**
 * Find array of date from input interval
 * @param     {Date} startDate - start of interval
 * @param     {Date} endDate - end of interval
 * @returns   {Array} array of moment date
 * @example    _createFormatMoment('10/10/2019')
 */
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
  leaveHandler,
  absentHandler,
  longAbsentHandler
};
