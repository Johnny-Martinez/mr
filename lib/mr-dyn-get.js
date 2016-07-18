#!/usr/bin/env node

const Printer = require('./printer');

module.exports = function (program) {
    program
        .command('dyn-get <table> <key>')
        .description("Pull back item from dynamo by key")
        .action((table, key, options) => {
            const AWS = require('./aws').init(options);
            const printer = new Printer(options);

            AWS.dynamo.getById(table, key, printer.printResponse());
        });
};
