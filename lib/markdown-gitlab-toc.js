'use strict';

var commander = require('commander');
var bluebird = require('bluebird');
var glob = bluebird.promisify(require('glob'));
var path = require('path');
var fs = bluebird.promisifyAll(require('fs'));
var objectDeep = require('object-deep');

module.exports = function *generateToc () {
  var paths = commander.args;
  var exclude = commander.exclude;

  var tree = {};

  var files = yield paths.map(function * (directory) {
    var items = yield glob(path.join(directory, '**/*.md'));

    return yield items
      .filter(function (item) {
        return exclude ? !item.match(new RegExp(exclude)) : true;
      })
      .map(function *(item) {
        return {
          parts: item.replace(`${directory}/`, '').split('/'),
          contents: yield fs.readFileAsync(item, { encoding: 'utf-8' })
        };
      });
  });

  files = Array.prototype.concat.apply([], files);


  for (let file of files) {
    objectDeep.set(tree, file.parts.slice(0, -1).map(replaceDots).join('.'), {
      '@': {
        path: file.parts.join('/'),
        header: readHeader(file.contents) || file.parts.slice(-1).join('')
      }
    });
  }

  var contents = convertToMarkdownTOC(tree);
  if (commander.output) {
    yield fs.writeFileAsync(commander.output, contents, { encoding: 'utf-8' });
  } else {
    console.log(contents);
  }
};

function replaceDots(item) {
  return item.replace(/\./g, '-');
}

function readHeader(contents) {
  var match = contents.match(/^ *#+ *[^\n]+/mg);
  match = match ? match[0].match(/#* *(.+)/) : '';
  return match ? match[1] : null;
}

function convertToMarkdownTOC(tree) {
  var output = [
    '# Table of Contents',
    ''
  ];

  (function traverse(tree, level) {

    for (let key in tree) {
      if (key === '@') {
        continue;
      }
      let item = tree[key];

      if (typeof item === 'object') {
        if (item.hasOwnProperty('@')) {
          output.push(`${strRepeat('\t', level)}* [${key}](${item['@'].path})`);
        } else {
          output.push(`${strRepeat('\t', level)}* ${key}`);
        }

        traverse(item, level + 1);
      } else {
      }

    }

  })(tree, 0);

  return output.join('\n');
}


function strRepeat(str, count) {
  var result = '';
  for (let i = 0; i < count; i++) {
    result += str;
  }
  return result;
}