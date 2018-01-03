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
		const from = this.active;
		const to = this._getNodeByName(name);
		if (( this.strict || forced ) && this.active.exitTo.indexOf(name) === -1) {
			throw new UnreachableNode(from.name, to.name);
		}
		this.exitGuard(to, from, this.entryGuard);
	}

	/**
	 * Before node transition, entry and exit guard functions are to be executed.
	 * This is an exit guard which checks if conditions are met for exiting a node.
	 * @param from {ChatNode}
	 * @param from.beforeExit {function}
	 * @param to {ChatNode}
	 * @param entryGuard {function}
	 */
	exitGuard (to, from, entryGuard) {
		if (!from.beforeExit) {
			this.entryGuard(to);
		} else {
			from.beforeExit(to, from, this.entryGuard);
		}
	}

	/**
	 * Before node transition, entry and exit guard functions are to be executed.
	 * This is an entry guard which checks if conditions are met for entering into a node.
	 * @param node {ChatNode} - Node to transition to.
	 * @param node.beforeEnter {function} - Call this function to check if transition to this node is allowed.
	 * @param node.name {string} - name of the node.
	 */
	entryGuard (node) {
		if (!node.beforeEnter) {
			this._next(node.name)();
		} else {
			node.beforeEnter(node, this.active, this._next(node.name));
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
		return this.graph[name];
	}


	/**
	 * A closure that wraps value of defaultName,
	 * so that the returned function retains the defaultName as the value of name.
	 *
	 * Facilitates the transition from a node to another
	 * Doesn't proceed with transition if node name is a boolean false.
	 * @param defaultName
	 * @returns {Function}
	 */
	_next (defaultName) {
		const self = this;
		return function (name = defaultName) {
			if (name === false) return 0;
			self.historyUpdate(self.active);
			self.active = self._getNodeByName(name);
		}
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
		graph[node.name] = node;
	}
	return graph;
}

module.exports = ChatGraph;