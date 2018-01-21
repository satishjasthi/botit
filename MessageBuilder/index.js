const _ = require('lodash');
const dataFetcher = require('../Data');
const config = require('../config/default.json');

/** Error to be thrown if the template is neither string or object */
const InvalidTemplateError = require('./Errors/InvalidTemplateErrors');

/** Error to be thrown if the MessageBuilder instance does not implement a build() method */
const MethodRequiredError = require('./Errors/MethodRequiredErrors');


/**
 * Message Builder class.
 * This helps in common message creation methods/helpers, inspired from vue.js
 * IMPORTANT: instances must have a compile method implemented!
 */
class MessageBuilder {

	/**
	 * @param {string} templates - The templates for messages that could be sent from a
	 * particular ChatNode. Contain variables enclosed in {{}}.
	 *
	 * @param {object} data - The object which gets attached to the MessageBuilder instance.
	 *
	 * @param {object} deps - Meant for items whose values are depended on certain chat-flow.
   *
   * @param {object} methods - Methods that can be called to change the values held by data/deps.
	 *
	 * @param {function} compile - Necessary to be implemented.
   *
	 * Guides which template from the map should be built.
	 * Run conditional checks to select the appropriate template.
	 */
	constructor ({
		templates,
		data = {},
		methods = {},
		compile,
    templateResolve
	}) {
		this._config = config;
		this.templates = {};
		this._bindTemplates(templates);
		this._attachData(data);
		this._attachMethods(methods);
		this.fetch = dataFetcher();
		if (!compile && typeof compile !== 'function') throw new MethodRequiredError();
		this.compile = compile;
		this.templateResolve = templateResolve;
	}

	/**
	 * @description Get templates from the templates parameter provided at instance creation
	 * templates must be object or string.
	 *
	 * Here a string passed as templates becomes an object of the form:
	 * { 'default': <templateString> }
	 *
	 * @param {string} templates
	 * @returns {*}
	 */
	_bindTemplates (templates) {
		for (let templateName of Object.keys(templates)) {
			if (typeof templates[templateName] !== 'function') {
				throw new InvalidTemplateError(templateName, templates[templateName]);
			}
			this.templates[templateName] = templates[templateName].bind(this);
		}
	}

	/**
	 * @description A key(string) value(Any) pair provided for variables that are not known at the time
	 * of flow creation but known once a user starts interaction.
	 * The key:values are attached to the MessageBuilder instance.
	 *
	 * @param {object} data
	 * @private
	 */
	_attachData (data) {
		for (let key of Object.keys(data)) {
			this[key] = data[key];
		}
	}


	/**
	 * @description A key(string) value(function) pair provided for methods that can be used for simplification
	 * of compile method, fetching/storing data.
	 * The key:values are attached to the MessageBuilder instance.
	 *
	 * @param methods
	 * @private
	 */
	_attachMethods (methods) {
    for (let key of Object.keys(methods)) {
      this[key] = methods[key].bind(this);
    }
  }


	/**
	 * @description Separates sentences by punctuation, returns an Array of word-groups for each sentence.
	 * This is to create an effect of multiple messages being sent, otherwise bots send
	 * a message per request. This is purely a cosmetic feature, aims at realistic feel
	 * of a bot.
	 *
	 * @param {string} text
	 * @returns {Array}
	 */
	$prepareRapids (text) {
		const sentences = text.split(/([.!?,]+)?=(\w+)/);
		return (_.random(0, 100) > 55) ? [text] : sentences
			.map(sentence => _rapidFireText(sentence))
			.filter(sentence => sentence.length > 0)
			.reduce((o, n) => {
				return o.concat(n);
			});
	}

	/**
	 * @description A message template may have multiple messages
	 * $randomize selects one out of the many and creates rapids.
	 *
	 * @param texts
	 * @returns {*}
	 */
	$randomize (texts) {
		if (typeof texts === 'string') return texts;
		return this.$prepareRapids(texts[_.random(0, texts.length - 1)])
	}

}


/**
 * @description Calculates the number of elements inside a nested 2-D Array,
 * @param {Array} arr
 * @returns {number}
 */
function innerElCount (arr) {
	let len = 0;
	for (let i of arr) { len += i.length }
	return len;
}


/**
 * @description Returns groups of words arranged in a random order, where
 * the smallest possible word group is of 2 words, and maximum of
 * total words present.
 *
 * @param {string} text
 * @returns {[String]}
 */
function _rapidFireText (text) {
	const words = text.trim().split(' ');
	const rapids = [];
	let i = 0, x = 0;
	while (innerElCount(rapids) < words.length) {
		x = _.random(2, words.length);
		rapids.push(words.slice(i, i + x));
		i += x;
	}
	return rapids.map(rapid => {
		const jointRapid = (_.random(0, 100) > 80) ? rapid.join('... ') : rapid.join(' ');
		return (_.random(0, 100) > 80) ? `${jointRapid}...` : jointRapid;
	});
}

module.exports = MessageBuilder;
