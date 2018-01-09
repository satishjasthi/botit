const ChatNode = require('../ChatNode');
const UnreachableNode = require('../Errors/UnreachableNode');

class ChatGraph {
	/**
	 * This creates the basic unit of a chat-flow.
	 * @param nodes {Array<object>} - Number of nodes in the chat
	 *
	 * @param root {string} - The first node in the conversation.
	 *
	 * @param mode {boolean} - Controls free flow between chat nodes.
	 * If true, nodes will transition on the basis of exitTo and exitFrom
	 */
	constructor ({ nodes, root = 'init', strict = true }) {
		this._nodes = nodes.map(node => new ChatNode(node));
		this.graph = setupGraph(this._nodes);
		this.active = this._getNodeByName(root);
		this.history = [this._getNodeByName(root)];
		this.strict = strict;
	}


	/**
	 * Transitions from a node to another are carried over by this method
	 * @param name {string} - name of the new node
	 * @param forced {boolean} - if strict is false, but strictness is to be enforced on a node level, set this flag to true
	 */
	go (name, forced = false) {
		/** @type {ChatNode} */
		const from = this.active;

		/** @type {string} */
		const fromNodeName = from.name;

		/** @type {ChatNode} */
		const to = this._getNodeByName(name);

		/** @type {string} */
		const toNodeName = to.name;

		if (from.name !== to.name) {
			if (( this.strict || forced ) && from.exitTo.indexOf(name) === -1) {
				throw new UnreachableNode(from.name, to.name);
			}
			ChatGraph.exitGuard(to, from, this._next({ defaultName: fromNodeName, exit: true }));
			ChatGraph.entryGuard(to, from, this._next({ defaultName: toNodeName, entry: true }));
			this.confirmNav(to, from);
		}
	}

	/**
	 * Before node transition, entry and exit guard functions are to be executed.
	 * This is an exit guard which checks if conditions are met for exiting a node.
	 * @param from {ChatNode}
	 * @param from.beforeExit {function}
	 * @param from.name {string}
	 * @param to {ChatNode}
	 * @param next {function}
	 */
	static exitGuard (to, from, next) {
		if (!from.beforeExit) {
			next();
		} else {
			from.beforeExit(to, from, next);
		}
	}


	/**
	 * Before node transition, entry and exit guard functions are to be executed.
	 * This is an entry guard which checks if conditions are met for entering a node.
	 * @param from {ChatNode}
	 * @param to {ChatNode}
	 * @param to.beforeEnter {function}
	 * @param to.name {function}
	 * @param next {function}
	 */
	static entryGuard (to, from, next) {
		if (!to.beforeEnter) {
			next();
		} else {
			to.beforeEnter(to, from, next);
		}
	}


	/**
	 * Update the history with each transition.
	 * @param node {ChatNode}
	 */
	historyUpdate (node) {
		this.history.push(node);
	}


	/**
	 * Find the node in graph by using the unique node name.
	 * @param name - Name of the node to be searched
	 * @returns {ChatNode}
	 * @private
	 */
	_getNodeByName (name) {
		return this.graph[name].node;
	}


	/**
	 * @param name {string}
	 * @param type {string}
	 * @param state {boolean}
	 * @private
	 */
	_setNodeNavStatus (name, type, state) {
		this.graph[name][type] = state;
	}


	/**
	 *
	 * @param name
	 * @param type
	 * @returns {*}
	 * @private
	 */
	_getNodeNavStatus (name, type) {
		return this.graph[name][type]
	}


	/**
	 * A closure that wraps value of defaultName,
	 * so that the returned function retains the defaultName as the value of name.
	 *
	 * Facilitates the transition from a node to another
	 * Doesn't proceed with transition if node name is a boolean false.
	 * @param defaultName {string}
	 * @param [entry] {boolean}
	 * @param [exit] {boolean}
	 * @returns {Function}
	 */
	_next ({ defaultName, entry, exit }) {
		const self = this;
		return function (name, forced = false) {
			if (name !== false && typeof name !== 'undefined' && name !== defaultName) {
				self.go(name, forced);
			} else {
				name = (name !== false) ? defaultName : name;
				self.setNodeByStateName(name, defaultName, exit, 'exitState');
				self.setNodeByStateName(name, defaultName, entry, 'entryState');
			}
		}
	}

	/**
	 * This method is created for re-usability in the .next() method.
	 * @param {string} name
	 * @param {string} defaultName
	 * @param {boolean} guardResult
	 * @param {string} guardTypeStr
	 */
	setNodeByStateName (name, defaultName, guardResult, guardTypeStr) {
		if (guardResult) {
			if (name === false) {
				this._setNodeNavStatus(defaultName, guardTypeStr, false);
			} else {
				this._setNodeNavStatus(name, guardTypeStr, guardResult);
			}
		}
	}

	/**
	 * When the guards are resolved, the navigation from ChatNodes can be fulfilled
	 * This method updates the history and active node.
	 * @param to
	 * @param from
	 */
	confirmNav (to, from) {
		const toNodeEntryState = this._getNodeNavStatus(to.name, 'entryState');
		const fromNodeExitState = this._getNodeNavStatus(from.name, 'exitState');
		if (toNodeEntryState && fromNodeExitState) {
			this.historyUpdate(this.active);
			this.active = this._getNodeByName(to.name);
		}
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
		graph[node.name] = {
			node,
			exitState: false,
			entryState: false
		};
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