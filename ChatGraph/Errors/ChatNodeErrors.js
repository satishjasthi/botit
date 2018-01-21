class InvalidNode extends Error {
	constructor (arg, val) {
		super();
		this.message = `A chat-node must have a ${arg}, you passed ${arg}=${typeof val}`;
		this.name = 'InvalidNode';
	}
}

module.exports = InvalidNode;