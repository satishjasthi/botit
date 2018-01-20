const InvalidNode = require('../Errors/ChatNodeErrors');

/**
 * @typedef ChatNode
 * @type {string} name
 * @type {string} path
 * @type {object} message
 * @type {[string]} exitTo
 * @type {null|object} params
 * @type {null|function} beforeEnter
 * @type {null|function} beforeExit
 */
class ChatNode {
	/**
	 *
	 * @param name - Name of the chat-node.
	 * @param path - Name of the path.
	 * @param intent - Name of the intent provided by AI/ML service.
	 * @param message - The message to be sent when this node is visited.
	 * @param exitTo - The nodes to which transition is allowed once this node is active.
	 * @param beforeEnter - The function to be called before the node is entered
	 * @param beforeExit - The function to be called after the node is exited
	 */
	constructor ({
		             name,
		             path,
								 intent,
		             message,
		             exitTo = [],
		             beforeEnter = null,
		             beforeExit = null
	             }) {
		validate('name', name);
		validate('path', path);
		validate('message', message);
		this.name = name.trim().toLowerCase();
		this.intent = intent;
		this.path = ChatNode.setPath(path);
		this.message = message;
		this.exitTo = exitTo;
		this.params = null;
		this.beforeEnter = beforeEnter;
		this.beforeExit = beforeExit;
	}

	/**
	 *
	 * @param path
	 * @returns {*}
	 */
	static setPath (path) {
		path = path.trim().toLowerCase();
		return (path[0] !== '/') ? `/${path}` : path;
	}

	/**
	 * Get query params from the path and set the params property.
	 * @param path
	 */
	setParams (path) {
		this.params = extractParams(path);
	}

	/**
	 * Set the message object
	 * @param message
	 */
	setMessage (message) {
		this.message = message;
	}


	/**
	 * Chat node entry guard
	 * @param to {ChatNode}
	 * @param from {ChatNode}
	 * @param next {function}
	 * @returns {boolean | undefined}
	 */
	beforeNodeEnter (to, from, next) {
		if (!this.beforeEnter) return true;
		this.beforeEnter.call(this, to, from, next);
	}


	/**
	 * Chat node exit guard
	 * @param to {ChatNode}
	 * @param from {ChatNode}
	 * @param next {function}
	 * @returns {boolean | undefined}
	 */
	beforeNodeExit (to, from, next) {
		if (!this.beforeExit) return true;
		this.beforeExit.call(this, to, from, next);
	}
}


/**
 * Validate if a required argument is missing at node creation step.
 * @param argName {string} - Name of the argument
 * @param arg {any}
 */
function validate (argName, arg) {
	if (arg === null || typeof arg === 'undefined') throw new InvalidNode(argName, arg);
}


/**
 * Get query params as a mapped object from the urlString
 * @param pathUrl {string}
 * @returns {*}
 */
function extractParams (pathUrl) {
	const paramList = pathUrl.split('?');
	if (paramList.length < 1) return null;
	const paramValueMapping = paramList[1].split('&');
	const params = {};
	let key, value;
	for (let i = 0; i < paramValueMapping[i].length; i++) {
		[key, value] = paramValueMapping.split('=');
		params[key] = value;
	}
	return params
}

module.exports = ChatNode;
