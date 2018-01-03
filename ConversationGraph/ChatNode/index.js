const InvalidNode = require('../Errors/ChatNodeErrors');

class ConversationNode {

	/**
	 *
	 * @param name - Name of the chat-node.
	 * @param path - Name of the path.
	 * @param message - The message to be sent when this node is visited.
	 * @param children - The dependent nodes that can trigger only if this node was previously visited
	 * @param entryFrom - The nodes from which this node is allowed.
	 * @param exitTo - The nodes to which transition is allowed once this node is active.
	 * @param beforeEnter - The function to be called before the node is entered
	 * @param beforeExit - The function to be called after the node is exited
	 */
	constructor ({
		             name,
		             path,
		             message,
		             children = [],
		             entryFrom = [],
		             exitTo = [],
		             beforeEnter = null,
		             beforeExit = null
	             }) {
		validate('name', name);
		validate('path', path);
		validate('message', message);
		this.name = name.trim().toLowerCase();
		this.path = path.trim().toLowerCase();
		this.children = children;
		this.message = message;
		this.entryFrom = entryFrom;
		this.exitTo = exitTo;
		this.params = null;
		this.beforeEnter = beforeEnter;
		this.beforeExit = beforeExit;
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
	 * Set entryForm property
	 * @param entryFrom
	 */
	setEntryFrom (entryFrom) {
		this.entryFrom = entryFrom;
	}

	/**
	 * Set exitTo property
	 * @param exitTo
	 */
	setExitTo (exitTo) {
		this.exitTo = exitTo;
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

module.exports = ConversationNode;