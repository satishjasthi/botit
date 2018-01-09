const messageBuilder = require('../../messageBuilder');

function introductionMessage () {
	return messageBuilder.textMessageBuilder({ message: `Hi ${} this is ${this.name}` });
}
