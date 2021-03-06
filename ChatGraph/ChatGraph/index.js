const ChatNode = require('../ChatNode');
const MessageBuilder = require('../../MessageBuilder');
const UnreachableNode = require('../Errors/UnreachableNode');
const HistoryModel = require('./chatHistory.mdl');
const bluebird = require('bluebird');

class ChatGraph {
	/**
	 * @description This creates the basic unit of a chat-flow.
	 * @param {string} userId - The userId of a user
	 * @param nodes {[object]} - Number of nodes in the chat
	 * @param root {string} - The first node in the conversation.
	 * @param {[String]} freeway - The list of nodes that can be entered from any node.
	 * @param strict {boolean} - Controls free flow between chat nodes.
	 * If true, nodes will transition on the basis of exitTo and exitFrom

	 * @returns {ChatGraph} itself through promise
	 */
	constructor ({ nodes, root = 'init', freeway = [], strict = true }) {
		this._nodes = nodes.map(node => new ChatNode(node));
		this.freeway = freeway;
		this.graph = setupGraph(this._nodes);
		this.strict = strict;
	}

	/**
	 * @description Initializes history Array for the current user
	 * @param {string} userId
	 * @param {string} root
	 * @private
	 */
	_initHistory (userId, root) {
    const self = this;

    const rootNode = self._getNodeByName(root);

    return HistoryModel.push(userId, {
      "name": rootNode.name,
      "path": rootNode.path
    }).then(() => {
      return bluebird.resolve(self);
    })
    .catch(err => {
      console.error(err);
      return bluebird.reject(err);
    })

	}

	/**
	 * @description An intent from an AI/ML service can be mapped to a node
	 * with the intent property on the node.
	 * If this method is provided the intent, it returns the matching node.
	 *
	 * @param intent
	 * @returns {*}
	 * @private
	 */
	_intentNodeMap (intent) {
		const filterFn = nodeName => (this.graph[nodeName].intent === intent);
		return Object.keys(this.graph)
			.filter(filterFn)
			.pop();
	}

	/**
	 * @description The exposed routing method, routes user to different ChatNodes if allowed
	 * @param {string} userId
	 * @param {string|object} to
	 * @param {string} to.intent
	 * @param {boolean} [forced=false]
	 * @returns {Promise|Promise.<T>}
	 */
	go (userId, to, forced = false, root = 'init') {
		const self = this;
		if (typeof to === 'object') {
			to = this._intentNodeMap(to.intent);
		}

		console.log('to Node', to);

		return HistoryModel.active(userId)
			.then(data => {
				const from = (Array.isArray(data) && data.length > 0) ? data[0].active.name : null;
				if (from !== null) {
					return self._go(userId, to, from, forced);
				}	else {
				  return this._initHistory(userId, root)
            .then(() => {
              return bluebird.resolve(this._getNodeByName(root))
            })
				}
			})
			.catch(err => { bluebird.reject(err) });
	}

	/**
	 * @description Transitions from a node to another are carried over by this method
	 * @param {string} userId - Transition is to be made for user with id = userId
	 * @param {string} toName - name of the new node
	 * @param {string} fromName - name of the currently active node
	 * @param forced {boolean} - if strict is false, but strictness is to be enforced on a node level, set this flag to true	 * @param userId
	 * @returns {Promise|Promise.<T>}
	 * @private
	 */
	_go (userId, toName, fromName, forced = false) {
		const self = this;
		const from = this._getNodeByName(fromName);
		const to = this._getNodeByName(toName);
		const freeNode = (this.freeway.indexOf(toName)) > -1;
		console.log(freeNode, toName);
		if (fromName !== toName) {
			if (!freeNode && ( this.strict || forced ) && from.exitTo.indexOf(toName) === -1) {
				return bluebird.reject(new UnreachableNode(from.name, to.name));
			} else {
				return ChatGraph.exitGuard({ from, to })
					.then(() => { return ChatGraph.entryGuard({ from, to }) })
					.then(() => { return this.historyUpdate(userId, to) })
					.then(() => { return bluebird.resolve(to); })
					.catch(err => { console.error('error', err); });
			}
		} else {
			return bluebird.resolve(from);
		}
	}

	/**
	 * @description Before node transition, entry and exit guard functions are to be executed.
	 * This is an exit guard which checks if conditions are met for exiting a node.
	 * @param from {ChatNode}
	 * @param from.beforeExit {function}
	 * @param to {ChatNode}
	 */
	static exitGuard ({ from, to }) {
		if (!from.beforeExit) {
			return bluebird.resolve(true);
		} else {
			return from.beforeExit(from, to);
		}
	}


	/**
	 * @description Before node transition, entry and exit guard functions are to be executed.
	 * This is an entry guard which checks if conditions are met for entering a node.
	 * @param from {ChatNode}
	 * @param to {ChatNode}
	 * @param to.beforeEnter {function}
	 */
	static entryGuard ({ from, to }) {
		if (!to.beforeEnter) {
			return bluebird.resolve(true);
		} else {
			return to.beforeEnter(from, to);
		}
	}


	/**
	 * @description Update the history with each transition.
	 * @param {string} userId - Update history for user with id = userId
	 * @param node {ChatNode}
	 */
	historyUpdate (userId, node) {
		// this.history.push(node);
		const self = this;
		return HistoryModel.push(userId, {
			"name": node.name,
			"path": node.path
		}).then(data => {
			self.active = node;
			return bluebird.resolve(data);
		});
	}


	/**
	 * @description Find the node in graph by using the unique node name.
	 * @param name - Name of the node to be searched
	 * @returns {ChatNode}
	 * @private
	 */
	_getNodeByName (name) {
		return this.graph[name];
	}

	/**
	 * @description This method can match any prop with given value in the ChatGraph
	 * use this to match nodes for given path
	 *
	 * @param prop
	 * @param val
	 * @returns {*}
	 * @private
	 */
	_getNodeByProp (prop, val) {
    for (let nodeName of Object.keys(this.graph)) {
      if (this.graph[nodeName][prop] === val) {
        return this.graph[nodeName]
      }
    }
		return null;
	}


	/**
	 * Match a node path if a url path is provided.
	 * @param urlPath
	 */
	matchNodeWithQuery (urlPath) {
		const {path, params} = queryParse(urlPath);
		return this._nodes.filter(node => {
			return node.path === path
		}).map(node => {
			node.params = params;
			return node;
		});
	}
}


/**
 * Create a loose graph where each node is accessible by it's name as key
 * and the node is the value
 *
 * @param nodes {[ChatNode]}
 * @returns {{[key]: ChatNode}}
 */
function setupGraph (nodes) {
	const graph = {};
	for (let node of nodes) {
		node.message = new MessageBuilder(node.message);
		graph[node.name] = node;
	}
	return graph;
}


/**
 * extract path and extract query params as a key/value object
 * @param {string }urlPath
 * @returns {{path: string, params: object}}
 */
function queryParse (urlPath) {
	if (typeof urlPath !== 'string') return {};
	const rawPath = urlPath.split('/');
	const path = getPathFromUrl(rawPath);
	const pathParts = rawPath.length;
	const trail = rawPath[pathParts - 1].split('?');
	const params = {};
	let paramArr = [];
	let key = '';
	let value = '';
	if (trail.length > 1) { paramArr =  trail[1].split('&'); }
	for(let i = 0; i < paramArr.length; i++) {
		[key, value] = paramArr[i].split('=');
		params[key] = value;
	}
	return {path, params};
}


/**
 * Get Path filtered off of its query params
 * @param {[string]} urlPathParts
 * @returns string
 */
function getPathFromUrl (urlPathParts) {
	if (!Array.isArray(urlPathParts) || urlPathParts.length === 0) return '';
	const urlPathPartsCopy = urlPathParts.slice();
	const lastIdx = urlPathPartsCopy.length - 1;
	urlPathPartsCopy[lastIdx] = filterQueryParams(urlPathPartsCopy[lastIdx]);
	return urlPathPartsCopy.join('/');
}


/**
 * Filters a url's query params
 * @param {string} queryStr
 * @returns string
 */
function filterQueryParams (queryStr) {
	if (typeof queryStr !== 'string') return '';
	return queryStr.split('?')[0]
}

module.exports = ChatGraph;
