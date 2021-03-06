'use strict';

var SaxAsync = require('sax-async');
var fs = require('fs');
var pg = require('pg');
var db = require('./db');
var csv = require('./csv');

module.exports = processFile;

/**
    Processes an XML file with <changeset> entries and dumps them
    into a postgres database.

    @param {Object} options Options object
    @param {string} options.filename Path to XML file
    @param {string} options.pgURL Postgres URL, like 'postgres://postgres@localhost/osm-comments'
    @param {boolean} options.initial If this is the initial run, generate CSV files to load into Postgres
    @param {processDoneCallback} callback called after file is done processing

    @callback processDoneCallback

    @returns {undefined}
*/

function processFile(options, callback) {
    options = options || {};
    options.isInitial = options.initial || false;
    options.filename = options.filename || 'data/discussions-latest.osm'; // 'data/discussions-latest.osm';
    options.pgURL = options.pgURL || process.env.OSM_COMMENTS_POSTGRES_URL || 'postgres://postgres@localhost/osm-comments';
    pg.connect(options.pgURL, function(err, client, done) {
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        parseChangesets(options, client, function() {
            done();
            if (callback) callback();
        });
    });
}

function parseChangesets(options, client, callback) {
    var saxStream = new SaxAsync();
    var currentChangeset, currentComment;
    var xmlFilename = options.filename;

    saxStream.hookSync('opentag', function(node) {
        var tagName = node.name.toLowerCase();
        if (tagName === 'changeset') {
            currentChangeset = node;
            currentChangeset.tags = [];
            currentChangeset.comments = [];
        } else if (tagName === 'tag') {
            currentChangeset.tags.push(node);
        } else if (tagName === 'comment') {
            currentComment = node;
        }
    });

    saxStream.hookAsync('closetag', function(next, tagName) {
        tagName = tagName.toLowerCase();
        if (tagName === 'changeset') {
            if (options.isInitial) {
                csv.saveChangeset(currentChangeset, next);
            } else {
                db.saveChangeset(client, currentChangeset, next);
            }
        } else if (tagName === 'tag') {
            next();
        } else if (tagName === 'comment') {
            currentChangeset.comments.push(currentComment);
            currentComment = null;
            next();
        } else {
            next();
        }
    });
    saxStream.hookSync('text', function(text) {
        if (text && text.trim() !== '') {
            currentComment.text = text;
        }
    });
    saxStream.hookSync('end', function() {
        // client.end();
        console.log('all done');
        if (options.isInitial) {
            csv.writeToCSV(function() {
                csv.writeUsers(function() {
                    callback();
                });
            });
        } else {
            callback();
        }
    });

    fs.createReadStream(xmlFilename)
        .pipe(saxStream);

}
