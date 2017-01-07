'use strict'

const test = require('ava')
const plugin = require('..')
const {readFileSync} = require('fs')
const path = require('path')
const posthtml = require('posthtml')
const fixtures = path.join(__dirname, 'fixtures')

test('basic', (t) => {
  const html = readFileSync(path.join(fixtures, 'basic.html'), 'utf8')
  const expected = readFileSync(path.join(fixtures, 'basic.expected.html'), 'utf8')
  return compare(t, html, expected)
})

test('option.output.id, option.output.class', (t) => {
  const html = '<div id="id" class="class1 class2">text</div>'
  return Promise.all([
    compare(t, html, `${html}<!-- /#id -->`, {output: {class: false}}),
    compare(t, html, `${html}<!-- /.class1.class2 -->`, {output: {id: false}}),
    compare(t, html, `${html}`, {output: {id: false, class: false}})
  ])
})

test('option.output.idTemplate, option.output.classTemplate', (t) => {
  const html = '<div id="id" class="class1 class2">text</div>'
  const templateOption = {
    output: {
      idTemplate: ' id="<%= attrs.id %>"',
      classTemplate: ' class="<%= attrs.class %>"'
    }
  }
  return Promise.all([
    compare(t, html, `${html}<!-- / id="id" class="class1 class2" -->`, templateOption)
  ])
})

test('option.output.template', (t) => {
  const html = '<div id="id" class="class1 class2">text</div>'
  const expect = `${html}<!-- end of ID -->`
  const option = {
    output: {
      template: 'end of <%= attrs.id.toUpperCase() %>'
    }
  }
  return Promise.all([
    compare(t, html, expect, option)
  ])
})

test('option.output.compiler', (t) => {
  const html = '<div id="id" class="class1 class2">text</div>'
  const expect = `${html}<!-- ====== end #id (class1,class2) ====== -->`
  const compiler = function (node) {
    const classes = node.attrs.class.replace(/ +/g, ',')
    const comment = []
    comment.push('======')
    comment.push(`end #${node.attrs.id}`)
    comment.push(`(${classes})`)
    comment.push('======')
    return comment.join(' ')
  }
  return Promise.all([
    compare(t, html, expect, {output: {compiler: compiler}})
  ])
})

test('option.output.beforeText', (t) => {
  const html = '<div id="id" class="class1 class2"></div>'
  return compare(t, html, `${html}<!-- end of #id.class1.class2 -->`, {output: {beforeText: 'end of '}})
})

test('option.output.afterText', (t) => {
  const html = '<div id="id" class="class1 class2"></div>'
  return compare(t, html, `${html}<!-- /#id.class1.class2 !!! -->`, {output: {afterText: ' !!!'}})
})

test('option.sameline', (t) => {
  const html = readFileSync(path.join(fixtures, 'basic.html'), 'utf8')
  const expected = readFileSync(path.join(fixtures, 'sameline.expected.html'), 'utf8')
  const htmlTab = '<p>\n\t<span id="foo"></span>\n</p>'
  const expectedTab = '<p>\n\t<span id="foo"></span>\n\t<!-- /#foo -->\n</p>'
  return Promise.all([
    compare(t, html, expected, {sameline: true}),
    compare(t, htmlTab, expectedTab, {sameline: true})
  ])
})

test('option.replaceAdjacentHyphens', (t) => {
  const html = '<div class="btn--large"></div>'
  return Promise.all([
    compare(t, html, `${html}<!-- /.btn__large -->`, {replaceAdjacentHyphens: true}),
    compare(t, html, `${html}<!-- /.btn~~large -->`, {replaceAdjacentHyphens: '~~'}),
    compare(t, html, `${html}<!-- /.btnlarge -->`, {replaceAdjacentHyphens: ''})
  ])
})

test('option.match', (t) => {
  const html = '<p class="class1 class2"></p><div class="btn btn--large"></div>'
  return Promise.all([
    compare(t, html, `${html}<!-- /.btn.btn--large -->`, {match: {attrs: {class: /btn/}}}),
    compare(t, html, '<p class="class1 class2"></p><!-- /.class1.class2 --><div class="btn btn--large"></div>', {match: {tag: 'p'}})
  ])
})

test('option.targetAttribute', (t) => {
  const html = '<div class="class1 class2"></div><div class="btn btn--large" data-comment-target></div>'
  const expected = '<div class="class1 class2"></div><div class="btn btn--large"></div><!-- /.btn.btn--large -->'
  return compare(t, html, expected, {targetAttribute: 'data-comment-target'})
})

/**
 * TODO: Priority Test
 * # match
 * match > targetAttribute
 *
 * # output
 * template.compiler > template.template > template.id|template.class
 *   > template.idTemplate|template.classTemplate|beforeText|afterText
 */

function compare (t, html, expected, option) {
  if (typeof option !== 'object') {
    option = {}
  }
  return posthtml([plugin(option)])
    .process(html)
    .then((res) => {
      t.truthy(res.html === expected)
    })
}
