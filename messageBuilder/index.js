const _ = require('lodash');
const InvalidTemplate = require('./Errors/InvalidTemplateErrors');
const varPattern = new RegExp(/{{([^}]+)}}/g);

class MessageBuilder {
	constructor ({
		templates,
		data,
		deps,
		build,
		fallbacks
	}) {
		this.templates = _getTemplates(templates);
		this._attachData(data);
		this._attachDeps(deps);
		this.build = build;
		this.fallbacks = fallbacks;
		this.variables = this._templateStrVarMap();
	}

	_attachData (data) {
		const obj = data();
		for (let key of Object.keys(obj)) {
			this[key] = obj[key];
		}
	}

	_attachDeps (deps) {
		for (let key of Object.keys(deps)) {
			this[key] = deps[key].val || deps[key].default || deps[key] || null;
		}
	}

	_templateStrVarMap () {
		const templateVarMap = {};
		for(let key of Object.keys(this.templates)) {
			templateVarMap[key] = _varFromTemplateString(this.templates[key]);
		}
		return templateVarMap;
	}

	exec () {
		const templateName = this.build() || 'default';
		let templateStr = this.templates[templateName];
		const unresolvedVariables = this.variables[templateName];
		const resolvedVariables = this._resolveVariables(unresolvedVariables);
		for (let key of Object.keys(resolvedVariables)) {
			templateStr = templateStr.replace(unresolvedVariables[key], resolvedVariables[key]);
		}
		return _prepareRapids(templateStr);
	}

	_resolveVariables (obj) {
		const cloneObj = _.cloneDeep(obj);
		for (let key of Object.keys(obj)) {
			if (this[key] === null) throw new UnresolvedVariable(key);
			cloneObj[key] = this[key];
		}
		return cloneObj;
	}


}

function _varFromTemplateString (templateStr) {
	const variables = {};
	let match = varPattern.exec(templateStr);
	while (match !== null) {
		variables[match[1].trim()] = match[0];
		match = varPattern.exec(templateStr);
	}
	return variables;
}

function _getTemplates (templates) {
	if (typeof templates !== 'string' && typeof templates !== 'object') throw new InvalidTemplate(templates);
	return (typeof templates === 'object')
		? templates
		: (typeof templates === 'string')
			? { 'default': templates }
			: '';
}

function innerElCount (arr) {
	let len = 0;
	for (let i of arr) { len += i.length }
	return len;
}

function _prepareRapids (text) {
	const sentences = text.split(/([.!?,]+)(?=[\w]+)/);
	console.log(sentences, sentences.length);
	return sentences.map(sentence => _rapidFireText(sentence))
}

function _rapidFireText (text) {
	const words = text.split(' ');
	const rapids = [];
	let i = 0, x = 0;
	while (innerElCount(rapids) < words.length) {
		x = _.random(2, words.length);
		rapids.push(words.slice(i, i + x));
		i += x;
	}
	return rapids.map(rapid => rapid.join(' '))
}

module.exports = MessageBuilder;
