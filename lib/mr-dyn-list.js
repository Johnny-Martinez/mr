#!/usr/bin/env node

const Printer = require('./printer');

module.exports = function (program) {
    program
        .command('dyn-list')
        .description("List all dynamo tables")
        .action((options) => {
            const AWS = require('./aws').init(options);
            const dynamo = new AWS.DynamoDB();
            const printer = new Printer(options);

            dynamo.listTables({}, printer.printResponse());
        });
};
