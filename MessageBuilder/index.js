const _ = require('lodash');
const dataFetcher = require('../Data');

/** Error to be thrown if the template is neither string or object */
const InvalidTemplateError = require('./Errors/InvalidTemplateErrors');

/** Error to be thrown if the variable has no value on the MessageBuilder instance */
const UnresolvedVariableError = require('./Errors/UnresolvedVariablesErrors');

/** Error to be thrown if the MessageBuilder instance does not implement a build() method */
const MethodRequiredError = require('./Errors/MethodRequiredErrors');

/**
 * This regular expression is chosen to represent variables in template string.
 * example: 'This is a {{variable}}' - maps {{variable}} to this template string.
 * @type {RegExp}
 */
const varPattern = new RegExp(/{{([^}]+)}}/g);

/**
 * Message Builder class.
 * This helps in common message creation methods/helpers, inspired from vue.js
 * IMPORTANT: instances must have a build method implemented!
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
	 * @param {function} build - Necessary to be implemented.
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
		this.templates = _getTemplates(templates);
		this._attachData(data);
		this._attachMethods(methods);
		this.fetch = dataFetcher;
		if (!compile && typeof compile !== 'function') throw new MethodRequiredError();
		this.compile = compile;
		this.templateResolve = templateResolve;
		this.variables = this._templateStrVarMap();
		this.values = {}
	}

	/**
	 * A key value pair provided for variables that are not known at the time
	 * of flow creation but known once a user starts interaction but not if
	 * evaluation cannot happen unless certain chat conditions are met.
	 * Use `deps` instead for such cases.
	 *
	 * The key:values are attached to the MessageBuilder instance.
	 *
	 * If there is a common property declared in `data` and `deps`, then `deps` takes precedence.
	 *
	 * @param {object} data
	 * @private
	 */
	_attachData (data) {
		for (let key of Object.keys(data)) {
			this[key] = data[key];
		}
	}


	_attachMethods (methods) {
    for (let key of Object.keys(methods)) {
      this[key] = methods[key].bind(this);
    }
  }

	/**
	 * Maps variables in a template to the key of the template
	 * @returns {{}}
	 * @private
	 */
	_templateStrVarMap () {
		const templateVarMap = {};
		for(let key of Object.keys(this.templates)) {
			templateVarMap[key] = _varFromTemplateString(this.templates[key]);
		}
		return templateVarMap;
	}

	/**
	 * This function adds the `data`/`deps` to a selected template
	 * IMPORTANT: build method is called here, make sure it is implemented.
	 */
	$exec (templateName) {
    const unresolvedVariables = this.variables[templateName];
    const resolvedVariables = this._resolveVariables(unresolvedVariables);

		let templateStr = this.templates[templateName];
		for (let key of Object.keys(resolvedVariables)) {
			templateStr = templateStr.replace(
			  unresolvedVariables[key],
        resolvedVariables[key]
      );
		}
		return _prepareRapids(templateStr);
	}

	/**
	 * Maps unresolved variables extracted from the template string
	 * to their value from the MessageBuilder instance.
	 * @param obj
	 * @returns {*}
	 * @private
	 */
	_resolveVariables (obj) {
		const cloneObj = _.cloneDeep(obj);
		for (let key of Object.keys(obj)) {
			if (this[key] === null) throw new UnresolvedVariableError(key);
			cloneObj[key] = _.get(this, key);
		}
		return cloneObj;
	}

}


/**
 * Extracts variables from a given template string.
 * Also stores the variable string for future replacement.
 *
 * @param {string} templateStr
 * @returns {{}}
 */
function _varFromTemplateString (templateStr) {
	const variables = {};
	let match = varPattern.exec(templateStr);
	while (match !== null) {
		variables[match[1].trim()] = match[0];
		match = varPattern.exec(templateStr);
	}
	return variables;
}


/**
 * Get templates from the templates parameter provided at instance creation
 * templates must be object or string.
 *
 * Here a string passed as templates becomes an object of the form:
 * { 'default': <templateString> }
 *
 * @param {string} templates
 * @returns {*}
 */
function _getTemplates (templates) {
	if (typeof templates !== 'string' && typeof templates !== 'object') throw new InvalidTemplateError(templates);
	return (typeof templates === 'object')
		? templates
		: (typeof templates === 'string')
			? { 'default': templates }
			: '';
}


/**
 * Calculates the number of elements inside a nested 2-D Array,
 * @param {Array} arr
 * @returns {number}
 */
function innerElCount (arr) {
	let len = 0;
	for (let i of arr) { len += i.length }
	return len;
}


/**
 * Separates sentences by punctuation, returns an Array of word-groups for each sentence.
 * This is to create an effect of multiple messages being sent, otherwise bots send
 * a message per request. This is purely a cosmetic feature, aims at realistic feel
 * of a bot.
 *
 * @param {string} text
 * @returns {Array}
 */
function _prepareRapids (text) {
	const sentences = text.split(/[.!?,]+/);
	return sentences
    .map(sentence => _rapidFireText(sentence))
    .filter(sentence => sentence.length > 0)
}


/**
 * Returns groups of words arranged in a random order, where
 * the smallest possible word group is of 2 words, and maximum of
 * total words present.
 *
 * @param {string} text
 * @returns {String}
 */
function _rapidFireText (text) {
	const words = text.trim().split(' ');
	const rapids = [];
	let i = 0, x = 0;
	while (innerElCount(rapids) < words.length) {
		x = _.random(4, words.length);
		rapids.push(words.slice(i, i + x));
		i += x;
	}
	return rapids.map(rapid => rapid.join(' ')).join('... ');
}

module.exports = MessageBuilder;
