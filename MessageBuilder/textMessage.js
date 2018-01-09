/**
 *
 * @param {string} message
 * @param {string} meta
 * @returns {{text: string, metadata?: string}}
 */
function textMessageBuilder ({ message, meta }) {
	const textMessage = { text: message };
	if (meta) textMessage['meta'] = meta;
	return textMessage;
}

module.export = textMessageBuilder;