'use strict';

var commander = require('commander');
var bluebird = require('bluebird');
var glob = bluebird.promisify(require('glob'));
var path = require('path');
var fs = bluebird.promisifyAll(require('fs'));
var objectDeep = require('object-deep');
var S = require('string');

module.exports = generateToc;

/**
 * @generator
 */
function *generateToc () {
  var paths = commander.args;
  var stdout = commander.output ? fs.createWriteStream(commander.output) : process.stdout;

  var files = yield paths.map(function * (directory) {
    var items = yield glob(path.join(directory, '**/README.md'));
    return yield items.filter(excludeFiles).map(mapFiles.bind(null, directory));
  });

  var tree = buildATree(Array.prototype.concat.apply([], files));

  return stdout.write(convertToMarkdownTOC(tree));

  /**
   *
   * @param item
   * @returns {boolean}
   */
  function excludeFiles(item) {
    return commander.exclude ? !item.match(new RegExp(commander.exclude)) : true;
  }

  function *mapFiles(directory, item) {
    return {
      parts: item.replace(`${directory}/`, '').split('/'),
      //contents: yield fs.readFileAsync(item, { encoding: 'utf-8' })
    };
  }
}

/**
 *
 * @param files
 * @returns {{}}
 */
function buildATree(files) {
  var tree = {};
  for (let file of files) {
    objectDeep.set(tree, file.parts.slice(0, -1).map(replaceDots).join('.'), {
      '@': {
        path: file.parts.join('/'),
        //header: readHeader(file.contents) || file.parts.slice(-1).join('')
        header: file.parts.slice(-1).join('')
      }
    });
  }

  return tree;
}

/**
 *
 * @param item
 * @returns {string}
 */
function replaceDots(item) {
  return item.replace(/\./g, '-');
}

///**
// *
// * @param contents
// * @returns {*}
// */
//function readHeader(contents) {
//  var match = contents.match(/^ *#+ *[^\n]+/mg);
//  match = match ? match[0].match(/#* *(.+)/) : '';
//  return match ? match[1] : null;
//}

/**
 *
 * @param tree
 * @returns {string}
 */
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
      let line = `${S('\t').repeat(level)}* `;

      if (typeof item !== 'object') {
        continue;
      }

      if (item.hasOwnProperty('@')) {
        let value = key || item['@'].header;
        line += `[${value}](${item['@'].path})`;
      } else {
        line += key;
      }

      output.push(line);
      traverse(item, level + 1);
    }

  })(tree, 0);

  return output.join('\n');
}