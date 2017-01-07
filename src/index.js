import _ from 'lodash'

/**
 * Default Option
 */
const defaultOption = {
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
}

export default function PostHTMLAfterCommentPlugin (option) {
  option = _.defaultsDeep(option, defaultOption)

  // generate template string
  const hasCompiler = typeof option.output.compiler === 'function'
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
  const template = hasCompiler ? option.output.compiler : _.template(templateString)

  // init expression
  let expression = option.match || [
    { attrs: { id: true } },
    { attrs: { class: true } }
  ]
  if (!option.match && typeof option.targetAttribute === 'string') {
    expression = [{ attrs: { [option.targetAttribute]: true } }]
  }

  // for indent
  const samelineExp = /^\n\s*$/
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
      const replaceAdjacentHyphens = option.output.replaceAdjacentHyphens
      if (replaceAdjacentHyphens !== false) {
        comment = comment.replace(/--/g, replaceAdjacentHyphens === true ? '__' : replaceAdjacentHyphens)
      }

      // return result
      const nodeWithComment = [node]
      if (option.output.sameline) {
        nodeWithComment.push(currentIndent)
      }
      if (comment !== '') {
        nodeWithComment.push(`<!-- ${comment} -->`)
      }
      return nodeWithComment
    })
  }
}
