const axios = require('axios');
const { USER_SERVER, LINE_SERVER, AUTH_TOKEN } = process.env;
axios.defaults.headers.common['authorization'] = AUTH_TOKEN;

/**
 * API request to USER_SERVER, will map data
 * GET
 *   /getAllUsers
 *      @return {Object} User data object
 */
getUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.user.map(user => {
    return {
      _id: user._id,
      lid: user.lid,
      uid: user.uid
    };
  });
};

/**
 * API request to USER_SERVER
 * POST
 *   /findUser
 *      @param userId {string} User uid.
 *      @return {Object} User data object
 */
findUser = async userId => {
  return (
    await axios.post(`${USER_SERVER}/findUser`, {
      uid: userId
    })
  ).data.user;
};

/**
 * API request to USER_SERVER
 * PATCH
 *   /updateUser
 *      @param id {string} User mongo id.
 *      @param lineId {string} User line id.
 *      @return {Object} User data object
 */
updateUser = async (id, lineId) => {
  return (
    await axios.patch(`${USER_SERVER}/updateUser/${id}`, {
      lid: lineId
    })
  ).data;
};

/**
 * API request to USER_SERVER
 * POST
 *   /getEmployeeId
 *      @param lineId {string} User line id.
 *      @return {Object} User data object
 */
getEmployeeId = async lineId => {
  return (await axios.get(`${USER_SERVER}/getEmployeeId/${lineId}`)).data.uid;
};

module.exports = {
  getUserList,
  findUser,
  updateUser,
  getEmployeeId
};
