const axios = require('axios');
const store = require('../Store');


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