/* eslint-env node */
'use strict';
var mergeTrees = require('broccoli-merge-trees');
var fs   = require('fs');
var flatiron = require('broccoli-flatiron');
var freestyleUsageSnippetFinder = require('./freestyle-usage-snippet-finder');

module.exports = {
  name: 'ember-freestyle',

  treeForApp: function(tree) {
    var treesToMerge = [tree];
    var self = this;

    var snippets = mergeTrees(this.snippetPaths().filter(function(path) {
      return fs.existsSync(path);
    }));

    snippets = mergeTrees(this.snippetSearchPaths().map(function(path) {
      return freestyleUsageSnippetFinder(path, self.ui);
    }).concat(snippets));

    snippets = flatiron(snippets, {
      outputFile: 'snippets.js'
    });
    treesToMerge.push(snippets);

    return mergeTrees(treesToMerge);
  },

  snippetPaths: function() {
    if (this.freestyleOptions) {
      return this.freestyleOptions.snippetPaths || ['snippets'];
    }
    return ['snippets'];
  },

  snippetSearchPaths: function() {
    if (this.freestyleOptions) {
      return this.freestyleOptions.snippetSearchPaths || ['app'];
    }
    return ['app'];
  },

  included: function(app) {
    this._super.included.apply(this, arguments);
    while (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    this.freestyleOptions = app.options.freestyle;
  },

  isDevelopingAddon: function() {
    return false;
  }
};
