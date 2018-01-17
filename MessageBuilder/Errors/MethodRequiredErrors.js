class MethodRequired extends TypeError {
	constructor () {
		super();
		this.message = 'Method "compile()" has to be implemented on the instance!';
		this.name = 'MethodRequired';
	}
}

module.exports = MethodRequired;