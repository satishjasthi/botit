const intentNodeMap = {
  "greeting": "init"
};

module.exports = function nodeNameMap (intent) {
  intent = intent.toLowerCase();
  const nodeName = intentNodeMap[intent];
  return nodeName || '';
};