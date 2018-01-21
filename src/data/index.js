const axios = require('axios');
const store = require('../store/index');

/**
 * @description returns an axios instance
 * @param axiosDefaults
 */
function getAxiosInstance (axiosDefaults) {
  if (typeof axiosDefaults === 'object') {
    axios.defaults = axiosDefaults;
  }
  return axios;
}

/**
 * @description returns methods to query external data via axios or mongoDB.
 * @param axiosDefaults
 * @returns {{$store: *, $http}}
 */
module.exports = function (axiosDefaults) {
  return {
	  '$store': store,
	  '$http': getAxiosInstance(axiosDefaults)
  }
};