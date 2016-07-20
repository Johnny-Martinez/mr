#!/usr/bin/env node

const Printer = require('./printer');

const action = (table, filter, options) => {
    const AWS = require('./aws').init(options);
    const printer = new Printer(options);

    AWS.dynamo.scan(table, filter, printer.printResponse());
};

const command = (program) => {
    program
        .command('dyn-sample <table> [filter]')
        .description("Pull back a sample 10 items from the specified table")
        .action(action);
};

exports.action = action;
exports.command = command;