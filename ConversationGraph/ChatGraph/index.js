const _MODES = { STRICT: 'strict', FLEX: 'flex' };

class ChatGraph {

	constructor (nodes, root = 'init', mode = 'strict') {
		this.graph = setupGraph(nodes);
		this.active = this._getNodeByName(root);
		this.history = [this._getNodeByName(root)];
		this.mode = mode;
	}

	go (name, forced = false) {
		if (this.mode === _MODES.STRICT && this.active.exitTo.indexOf(name) === -1) {
			// throw error
		} else if (this.mode !== _MODES.STRICT && forced && this.active.exitTo.indexOf(name) === -1) {
			// throw error
		}
		this.entryGuard(this._getNodeByName(name));
	}

	entryGuard (node) {
		node.beforeEnter(node.name, this.active.name, this.next(node.name))
	}

	historyUpdate (node) {
		this.history.push(node);
	}

	_getNodeByName (name) {
		return this.graph[name];
	}

	next (defaultName) {
		const self = this;
		return function (name = defaultName) {
			if (name === false) return 0;
			self.historyUpdate(self.active);
			self.active = self._getNodeByName(name);
		}
	}
}

function setupGraph (nodes) {
	const graph = {};
	for (let node of nodes) {
		graph[node.name] = node;
	}
	return graph;
}