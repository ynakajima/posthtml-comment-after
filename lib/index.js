'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PostHTMLAfterCommentPlugin;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Default Option
 */
var defaultOption = {
  output: {
    sameline: false,
    id: true,
    idTemplate: '#<%= attrs.id %>',
    class: true,
    classTemplate: '.<% print(attrs.class.trim().replace(/\\s+/g, ".")); %>',
    beforeText: '/',
    afterText: '',
    template: false,
    compiler: false,
    replaceAdjacentHyphens: false
  },
  targetAttribute: false,
  match: false
};

function PostHTMLAfterCommentPlugin(option) {
  option = _lodash2.default.defaultsDeep(option, defaultOption);

  // generate template string
  var hasCompiler = typeof option.output.compiler === 'function';
  var templateString = option.output.template || '';
  if (!hasCompiler && !templateString && (option.output.id || option.output.class)) {
    var templateStrings = [option.output.beforeText];
    if (option.output.id) {
      templateStrings.push('<% if (attrs.id) { %>');
      templateStrings.push(option.output.idTemplate);
      templateStrings.push('<% } %>');
    }
    if (option.output.class) {
      templateStrings.push('<% if (attrs.class) { %>');
      templateStrings.push(option.output.classTemplate);
      templateStrings.push('<% } %>');
    }
    templateStrings.push(option.output.afterText);
    templateString = templateStrings.join('');
  }

  // generate template compiler
  var template = hasCompiler ? option.output.compiler : _lodash2.default.template(templateString);

  // init expression
  var expression = option.match || [{ attrs: { id: true } }, { attrs: { class: true } }];
  if (!option.match && typeof option.targetAttribute === 'string') {
    expression = [{ attrs: { [option.targetAttribute]: true } }];
  }

  // for indent
  var samelineExp = /^\n\s*$/;
  if (_lodash2.default.isArray(expression)) {
    expression.push(samelineExp);
  } else {
    expression = [expression, samelineExp];
  }

  return function commentAfter(tree) {
    var currentIndent = '\n';
    return tree.match(expression, function (node) {
      // get current indent
      if (typeof node === 'string') {
        currentIndent = node;
        return node;
      }

      // ignore processed node
      if (node.__commentAfterProcessed) {
        return node;
      }

      // generate comment
      var comment = template(node);

      // remove targetattribute
      if (option.targetAttribute) {
        node.attrs[option.targetAttribute] = null;
      }

      // processed flug up
      node.__commentAfterProcessed = true;

      // replace adjacent hyphens
      var replaceAdjacentHyphens = option.output.replaceAdjacentHyphens;
      if (replaceAdjacentHyphens !== false) {
        comment = comment.replace(/--/g, replaceAdjacentHyphens === true ? '__' : replaceAdjacentHyphens);
      }

      // return result
      var nodeWithComment = [node];
      if (option.output.sameline) {
        nodeWithComment.push(currentIndent);
      }
      if (comment !== '') {
        nodeWithComment.push(`<!-- ${ comment } -->`);
      }
      return nodeWithComment;
    });
  };
}
module.exports = exports['default'];