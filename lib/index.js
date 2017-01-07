'use strict'
let _ = require('lodash')

/**
 * Default Option
 */
let defaultOption = {
  output: {
    id: true,
    idTemplate: '#<%= attrs.id %>',
    class: true,
    classTemplate: '.<% print(attrs.class.trim().replace(/\\s+/g, ".")); %>',
    beforeText: '/',
    afterText: '',
    template: false,
    compiler: false
  },
  sameline: false,
  targetAttribute: false,
  replaceAdjacentHyphens: false,
  match: false
}

module.exports = function (option) {
  option = _.defaultsDeep(option, defaultOption)

  // generate template string
  let hasCompiler = typeof option.output.compiler === 'function'
  let templateString = option.output.template || ''
  if (!hasCompiler && !templateString && (option.output.id || option.output.class)) {
    let templateStrings = [option.output.beforeText]
    if (option.output.id) {
      templateStrings.push('<% if (attrs.id) { %>')
      templateStrings.push(option.output.idTemplate)
      templateStrings.push('<% } %>')
    }
    if (option.output.class) {
      templateStrings.push('<% if (attrs.class) { %>')
      templateStrings.push(option.output.classTemplate)
      templateStrings.push('<% } %>')
    }
    templateStrings.push(option.output.afterText)
    templateString = templateStrings.join('')
  }

  // generate template compiler
  let template = hasCompiler ? option.output.compiler : _.template(templateString)

  // init expression
  let expression = option.match || [
    { attrs: { id: true } },
    { attrs: { class: true } }
  ]
  if (!option.match && typeof option.targetAttribute === 'string') {
    expression = [{ attrs: { [option.targetAttribute]: true } }]
  }

  // for indent
  let samelineExp = /^\n\s*$/
  if (_.isArray(expression)) {
    expression.push(samelineExp)
  } else {
    expression = [expression, samelineExp]
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
      let comment = template(node)

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
      if (option.sameline) {
        nodeWithComment.push(currentIndent)
      }
      if (comment !== '') {
        nodeWithComment.push(`<!-- ${comment} -->`)
      }
      return nodeWithComment
    })
  }
}
