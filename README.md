# PostHTML Comment After Plugin <img align="right" width="220" height="200" title="PostHTML logo" src="http://posthtml.github.io/posthtml/logo.svg">

[![NPM][npm]][npm-url]
[![Deps][deps]][deps-url]
[![Build][build]][build-badge]
[![Cover][cover]][cover-badge]
[![Standard Code Style][style]][style-url]
[![license MIT][license]][license-url]

> A PostHTML plug-in that adds comments after HTML elements.

Before:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p>
    </div>
  </body>
</html>
```

After:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p><!-- /.wow -->
    </div><!-- /#wrapper.container -->
  </body>
</html>
```

## Install

    npm install posthtml posthtml-comment-after --save-dev

## Usage

``` js
const fs = require('fs');
const posthtml = require('posthtml');
const commentAfter = require('posthtml-comment-after');

posthtml()
  .use(commentAfter())
  .process(html)
  .then(result => fs.writeFileSync('./after.html', result.html));
```

## Options
* output
  * [sameline](#output.sameline)
  * [id](#output.id)
  * [class](#output.class)
  * [idTemplate](#output.idTemplate)
  * [classTemplate](#output.classTemplate)
  * [beforeText](#output.beforeText)
  * [afterText](#output.afterText)
  * [templete](#output.template)
  * [compiler](#output.compiler)
  * [replaceAdjacentHyphens](#output.replaceAdjacentHyphens)
* [targetAttribute](#targetAttribute)
* [match](#match)

<a id="sameline"></a>
### output.sameline

You can specify whether to insert comments on the same line. 

#### Default
* output.sameline: `true`

Add option:
``` js
const option = {
  output: {
    sameline: false
  }
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => console.log(result.html));
```
Before:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p>
    </div>
  </body>
</html>
```
After: *comment is inserted after a line break.*
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p>
      <!-- /.wow -->
    </div>
    <!-- /#wrapper.container -->
  </body>
</html>
```

<a id="output.id"></a>
<a id="output.class"></a>
### output.id<br />output.class
You can specify display / non-display of `id` and `class` name in comment. 

#### Default
* output.id: `true`
* output.class: `true`

Add option:
``` js
const option = {
  output: {
    id: true,
    class: false
  }
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => fs.writeFileSync('./after.html', result.html));
```
Before:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p>
    </div>
  </body>
</html>
```
After: *id name is displayed, and class name is hidden.*
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p>
    </div><!-- /#wrapper -->
  </body>
</html>
```
> **Note**: If both are set to false, comments will not be inserted.


<a id="output.beforeText"></a>
<a id="output.afterText"></a>
### output.beforeText<br />output.afterText

You can specify the text to insert before and after the comment. 

#### Default
* output.beforeText: `'/'`
* output.afterText: `''`

Add option:
``` js
const option = {
  output: {
    beforeText: 'End of '
    afterText: ' !!!!' 
  }
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => fs.writeFileSync('./after.html', result.html));
```
Before:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p>
    </div>
  </body>
</html>
```
After:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p><!-- End of .wow !!!! -->
    </div><!-- End of #wrapper.container !!!! -->
  </body>
</html>
```


<a id="output.idTemplate"></a>
<a id="output.classTemplate"></a>
### output.idTemplate<br />output.classTemplate

You can specify how id names and class names are displayed in comments by [underscore template format](http://underscorejs.org/#template).

#### Default
* output.idTemplate: `'#<%= attrs.id %>'`
* output.classTemplate: `'.<% print(attrs.class.trim().replace(/\\s+/g, ".")); %>'`

> **Note**: The variables that can be used in the template are [PostHTML AST Node properties](https://github.com/posthtml/posthtml-parser#posthtml-ast-format).

Add option:
``` js
const option = {
  output: {
    idTemplate: ' id: <%= attrs.id.toUpperCase() %>',
    classTemplate: ' class: <%= attrs.class.trim().replace(/\\s+/g, ", ") %>' 
  }
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => console.log(result.html));
```
Before:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow foooo">OMG</p>
    </div>
  </body>
</html>
```
After:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow foooo">OMG</p><!-- / class: wow, foooo -->
    </div><!-- / id: WRAPPER class: container -->
  </body>
</html>
```

<a id="output.template"></a>
### output.template

You can specify the comment format freely by [underscore template format](http://underscorejs.org/#template).

> **Note**: This option *overrides* `output.idTemplate`, `output.classTemplate`, `output.beforeText`, and `output.afterText`.

#### Default
* output.template: `false`

Add option:
``` js
const option = {
  output: {
    template: '<% if (attrs.id) { %>=== end of <%= attrs.id %> ===<% } %>'
  }
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => console.log(result.html));
```
Before:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p>
    </div>
  </body>
</html>
```
After:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow">OMG</p>
    </div><!-- === end of wrapper === -->
  </body>
</html>
```
> **Note**: If the compiled text is empty, comments are not inserted.


<a id="output.compiler"></a>
### output.compiler

You can freely customize the comment contents with the function you created.

> **Note**: This option *overrides* `output.template`, `output.idTemplate`, `output.classTemplate`, `output.beforeText`, and `output.afterText`.

#### Default
* output.compiler: `false`

Add option:
``` js
function myCompiler (className) {

  return function (node) {
    if (!node.attrs || !node.attrs.class) {
      return '';
    }
    
    if (node.attrs.class.split(' ').includes(className)) {
      return `👈 This Element has .${className} !!!`;
    }
    return '';
  };

}

const option = {
  output: {
    compiler: myCompiler('wow')
  }
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => console.log(result.html));
```
Before:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow foooo">OMG</p>
    </div>
  </body>
</html>
```
After:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <p class="wow foooo">OMG</p><!-- 👈 This Element has .wow !!! -->
    </div>
  </body>
</html>
```
> **Note**: If the compiled text is empty, comments are not inserted.


<a id="output.replaceAdjacentHyphens"></a>
### output.replaceAdjacentHyphens

You can specify whether to replace adjacent hyphens.

#### Default
* output.replaceAdjacentHyphens: `false`

> **Note**: In WHATWG 's HTML, it is now allowed to accept adjacent hyphens in comments. ([Update commit of 2016-06-21](https://github.com/whatwg/html/commit/518d16fdc672d1023dcfd2847d86f559d13a842f))

Add option:
``` js
const option = {
  output: {
    replaceAdjacentHyphens: true
  }
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => console.log(result.html));
```
Before:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <a class="btn btn--large">OMG</a>
    </div>
  </body>
</html>
```
After: *If `true` is specified, it is replaced with '__'.*
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <a class="btn btn--large">OMG</a><!-- /.btn.btn__large -->
    </div><!-- #wrapper.container -->
  </body>
</html>
```

Add option:
``` js
const option = {
  output: {
    replaceAdjacentHyphens: '~~'
  }
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => console.log(result.html));
```
After:
``` html
<html>
  <body>
    <div id="wrapper" class="container">
      <a class="btn btn--large">OMG</a><!-- /.btn.btn~~large -->
    </div><!-- #wrapper.container -->
  </body>
</html>
```

<a id="targetAttribute"></a>
### targetAttribute

Insert comments only on elements with specified attributes.

#### Default
* targetAttribute: `false`

Add option:
``` js
const option = {
  targetAttribute: 'data-posthtml-comment-after'
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => console.log(result.html));
```
Before:
``` html
<html>
  <body>
    <div class="block" data-posthtml-comment-after>
      <p class="block__elem"></p>
    </div>
    <div class="block block--mod">
      <p class="block__elem" data-posthtml-comment-after></p>
      <p class="block__elem"></p>
    </div>
  </body>
</html>
```
After:
``` html
<html>
  <body>
    <div class="block">
      <p class="block__elem"></p>
    </div><!-- /.block -->
    <div class="block block--mod">
      <p class="block__elem"></p><!-- /.block__elem -->
      <p class="block__elem"></p>
    </div>
  </body>
</html>
```


<a id="match"></a>
### match

You can specify [expression](https://github.com/posthtml/posthtml/blob/master/docs/api.md#treematchexpression-cb--function) to match the node.

#### Default
* match: `false`

Add option:
``` js
const option = {
  match: {
    attrs: {
      class: /^(?!.*__).+$/ // match class not including '__'.
    }
  }
};

posthtml()
  .use(commentAfter(option))
  .process(html)
  .then(result => console.log(result.html));
```
Before:
``` html
<html>
  <body>
    <div class="block">
      <p class="block__elem"></p>
    </div>
    <div class="block block--mod">
      <p class="block__elem"></p>
      <p class="block__elem"></p>
    </div>
  </body>
</html>
```
After: *comment is inserted only in BEM Block*
``` html
<html>
  <body>
    <div class="block">
      <p class="block__elem"></p>
    </div><!-- /.block -->
    <div class="block block--mod">
      <p class="block__elem"></p>
      <p class="block__elem"></p>
    </div><!-- /.block.block--mod -->
  </body>
</html>
```


## Contributing

See [PostHTML Guidelines](https://github.com/posthtml/posthtml/tree/master/docs) and [contribution guide](CONTRIBUTING.md).

## License

[MIT][license-url]

[npm]: https://img.shields.io/npm/v/posthtml-comment-after.svg
[npm-url]: https://npmjs.com/package/posthtml-comment-after

[deps]: https://david-dm.org/ynakajima/posthtml-comment-after.svg
[deps-url]: https://david-dm.org/ynakajima/posthtml-comment-after

[style]: https://img.shields.io/badge/code%20style-standard-yellow.svg
[style-url]: http://standardjs.com/

[build]: https://travis-ci.org/ynakajima/posthtml-comment-after.svg?branch=master
[build-badge]: https://travis-ci.org/ynakajima/posthtml-comment-after?branch=master

[cover]: https://coveralls.io/repos/ynakajima/posthtml-comment-after/badge.svg?branch=master
[cover-badge]: https://coveralls.io/r/ynakajima/posthtml-comment-after?branch=master

[license]: http://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/ynakajima/posthtml-comment-after/blob/master/LICENSE
