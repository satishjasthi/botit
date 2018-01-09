class UnresolvedVariable extends Error {
	constructor (key) {
		super();
		this.message = `Variable ${key} is unresolved!`;
		this.name = 'UnresolvedVariable';
	}
}

module.exports = UnresolvedVariable;