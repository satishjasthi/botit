class UnreachableNode extends Error {
	constructor (from, to) {
		super();
		this.message = `There is no path from [node: '${from}'] to [node: '${to}']`;
		this.name = 'UnreachableNode';
	}
}

module.exports = UnreachableNode;