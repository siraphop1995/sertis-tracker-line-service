const axios = require('axios');
const { USER_SERVER, LINE_SERVER, AUTH_TOKEN } = process.env;
axios.defaults.headers.common['authorization'] = AUTH_TOKEN;

getUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.user.map(user => {
    return {
      _id: user._id,
      lid: user.lid,
      uid: user.uid
    };
  });
};

findUser = async userId => {
  return (
    await axios.post(`${USER_SERVER}/findUser`, {
      uid: userId
    })
  ).data.user;
};

updateUser = async (id, lineId) => {
  return (
    await axios.patch(`${USER_SERVER}/updateUser/${id}`, {
      lid: lineId
    })
  ).data;
};

getEmployeeId = async lineId => {
  return (await axios.get(`${USER_SERVER}/getEmployeeId/${lineId}`)).data.uid;
};

module.exports = {
  getUserList,
  findUser,
  updateUser,
  getEmployeeId
};
