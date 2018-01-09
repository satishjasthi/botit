class InvalidTemplate extends TypeError {
	constructor (variable) {
		super();
		this.message = `Template should be of type "string" or "object" but type ${typeof variable} was provided`;
		this.name = 'InvalidTemplate';
	}
}