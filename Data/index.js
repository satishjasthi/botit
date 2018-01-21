const axios = require('axios');
const store = require('../store');


function getAxiosInstance (axiosDefaults) {
  if (typeof axiosDefaults === 'object') {
    axios.defaults = axiosDefaults;
  }
  return axios;
}

module.exports = function (axiosDefaults) {
  return {
	  '$store': store,
	  '$http': getAxiosInstance(axiosDefaults)
  }
};