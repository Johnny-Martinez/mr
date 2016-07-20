#!/usr/bin/env node

const Printer = require('./printer');

const action = (table, options) => {
    const AWS = require('./aws').init(options);
    const dynamo = new AWS.DynamoDB({ region: options.region || "eu-west-1" });
    const printer = new Printer(options);

    dynamo.describeTable({ TableName: table }, printer.printResponse());
};

const command = (program) => {
    program
        .command('dyn-table <table>')
        .description("Describe a dynamo table")
        .action(action);
};

exports.action = action;
exports.command = command;