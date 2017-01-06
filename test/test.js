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

test('option.template', (t) => {
  const html = '<div id="id" class="class1 class2">text</div>'
  const templateOption = {
    template: {
      idTemplate: ' id="<%= attrs.id %>"',
      classTemplate: ' class="<%= attrs.class %>"'
    }
  }
  const compiler = function (node) {
    return `====== end #${node.attrs.id} (${node.attrs.class.replace(/ +/g, ',')}) ======`
  }
  return Promise.all([
    compare(t, html, `${html}<!-- /#id -->`, {template: {class: false}}),
    compare(t, html, `${html}<!-- /.class1.class2 -->`, {template: {id: false}}),
    compare(t, html, `${html}`, {template: {id: false, class: false}}),
    compare(t, html, `${html}<!-- / id="id" class="class1 class2" -->`, templateOption),
    compare(t, html, `${html}<!-- end of ID -->`, {template: {template: 'end of <%= attrs.id.toUpperCase() %>'}}),
    compare(t, html, `${html}<!-- ====== end #id (class1,class2) ====== -->`, {template: {compiler: compiler}})
  ])
})

test('option.beforeText', (t) => {
  const html = '<div id="id" class="class1 class2"></div>'
  return compare(t, html, `${html}<!-- end of #id.class1.class2 -->`, {beforeText: 'end of '})
})

test('option.afterText', (t) => {
  const html = '<div id="id" class="class1 class2"></div>'
  return compare(t, html, `${html}<!-- /#id.class1.class2 !!! -->`, {afterText: ' !!!'})
})

test('option.newline', (t) => {
  const html = readFileSync(path.join(fixtures, 'basic.html'), 'utf8')
  const expected = readFileSync(path.join(fixtures, 'newline.expected.html'), 'utf8')
  return Promise.all([
    compare(t, html, expected, {newline: true}),
    compare(t, '<p>\n\t<span id="foo"></span>\n</p>', '<p>\n\t<span id="foo"></span>\n\t<!-- /#foo -->\n</p>', {newline: true})
  ])
})

test('option.commentAttribute.name', (t) => {
  const html = '<div id="id" class="class1 class2" my-comment="My Comment" data-posthtml-comment-after="Comment After"></div>'
  const expected = '<div id="id" class="class1 class2" data-posthtml-comment-after="Comment After"></div><!-- My Comment -->'
  return compare(t, html, expected, {commentAttribute: {name: 'my-comment'}})
})

test('option.commentAttribute.ignore', (t) => {
  const html = '<div id="id" class="class1 class2" data-posthtml-comment-after="Comment After"></div>'
  const expected = '<div id="id" class="class1 class2"></div><!-- /#id.class1.class2 -->'
  return compare(t, html, expected, {commentAttribute: {ignore: true}})
})

test('option.commentAttribute.remove', (t) => {
  const html = '<div id="id" class="class1 class2" data-posthtml-comment-after="Comment After"></div>'
  return compare(t, html, `${html}<!-- Comment After -->`, {commentAttribute: {remove: false}})
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
 * match > targetAttribute > commentAttribute
 *
 * # output
 * template.compiler > commentAttribute > template.template > template.id|template.class
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
