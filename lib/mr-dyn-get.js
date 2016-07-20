#!/usr/bin/env node

const Printer = require('./printer');

const action = (table, key, options) => {
    const AWS = require('./aws').init(options);
    const printer = new Printer(options);

    AWS.dynamo.getById(table, key, printer.printResponse());
};

const command = (program) => {
    program
        .command('dyn-get <table> <key>')
        .description("Pull back item from dynamo by key")
        .action(action);
};

exports.action = action;
exports.command = command;