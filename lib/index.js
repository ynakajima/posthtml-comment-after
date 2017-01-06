'use strict'
let _ = require('lodash')

/**
 * Default Option
 */
let defaultOption = {
  template: {
    id: true,
    idTemplate: '#<%= attrs.id %>',
    class: true,
    classTemplate: '.<% print(attrs.class.replace(/ +/g, ".")); %>',
    template: false,
    compiler: false
  },
  beforeText: '/',
  afterText: '',
  newline: false,
  targetAttribute: false,
  commentAttribute: {
    name: 'data-posthtml-comment-after',
    ignore: false,
    remove: true
  },
  replaceAdjacentHyphens: false,
  match: false
}

module.exports = function (option) {
  option = _.defaultsDeep(option, defaultOption)

  // generate template string
  let hasCompiler = typeof option.template.compiler === 'function'
  let templateString = option.template.template || ''
  if (!hasCompiler && !templateString && (option.template.id || option.template.class)) {
    let templateStrings = [option.beforeText]
    if (option.template.id) {
      templateStrings.push('<% if (attrs.id) { %>')
      templateStrings.push(option.template.idTemplate)
      templateStrings.push('<% } %>')
    }
    if (option.template.class) {
      templateStrings.push('<% if (attrs.class) { %>')
      templateStrings.push(option.template.classTemplate)
      templateStrings.push('<% } %>')
    }
    templateStrings.push(option.afterText)
    templateString = templateStrings.join('')
  }

  // generate template compiler
  let template = hasCompiler ? option.template.compiler : _.template(templateString)

  // init expression
  let expression = option.match || [
    { attrs: { id: true } },
    { attrs: { class: true } }
  ]
  if (!option.match && typeof option.targetAttribute === 'string') {
    expression = [{ attrs: { [option.targetAttribute]: true } }]
  }

  // for indent
  let newLineExp = /^\n\s*$/
  if (_.isArray(expression)) {
    expression.push(newLineExp)
  } else {
    expression = [expression, newLineExp]
  }

  // for commentAttribute
  let commentAttribute = option.commentAttribute.name
  if (commentAttribute && !option.commentAttribute.ignore) {
    expression.push({ attrs: { [commentAttribute]: true } })
  }

  return function commentAfter (tree) {
    let currentIndent = '\n'
    return tree.match(expression, (node) => {
      // get current indent
      if (typeof node === 'string') {
        currentIndent = node
        return node
      }

      // ignore processed node
      if (node.__commentAfterProcessed) {
        return node
      }

      // generate comment
      let comment = !hasCompiler && !option.commentAttribute.ignore && node.attrs[commentAttribute] ? node.attrs[commentAttribute] : template(node)

      // remove comment attribute
      if (option.commentAttribute.remove) {
        node.attrs[commentAttribute] = null
      }

      // remove targetattribute
      if (option.targetAttribute) {
        node.attrs[option.targetAttribute] = null
      }

      // processed flug up
      node.__commentAfterProcessed = true

      // replace adjacent hyphens
      if (option.replaceAdjacentHyphens !== false) {
        comment = comment.replace(/--/g, option.replaceAdjacentHyphens === true ? '__' : option.replaceAdjacentHyphens)
      }

      // return result
      let nodeWithComment = [node]
      if (option.newline) {
        nodeWithComment.push(currentIndent)
      }
      if (comment !== '') {
        nodeWithComment.push(`<!-- ${comment} -->`)
      }
      return nodeWithComment
    })
  }
}
