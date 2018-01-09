const messageBuilder = require('../../MessageBuilder');

function introductionMessage () {
	return messageBuilder.textMessageBuilder({ message: `Hi ${} this is ${this.name}` });
}
