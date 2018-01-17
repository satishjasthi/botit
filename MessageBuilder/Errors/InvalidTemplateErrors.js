class InvalidTemplate extends TypeError {
	constructor (name, variable) {
		super();
		this.message = `Template ${name} should be of type "string" or "object" but type ${typeof variable} was provided`;
		this.name = 'InvalidTemplate';
	}
}

module.exports = InvalidTemplate;