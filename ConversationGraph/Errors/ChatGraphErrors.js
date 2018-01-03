class NodeDisAllowed extends Error {
	constructor (to, from) {
		super();
		this.message = `Cannot navigate from node '${from.name}' to '${to.name}'`;
		this.name = 'NodeDisAllowed';
	}
}

module.exports = NodeDisAllowed;