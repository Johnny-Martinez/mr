#!/usr/bin/env node

const Printer = require('./printer');

module.exports = function (program) {
    program
        .command('dyn-table <table>')
        .description("Describe a dynamo table")
        .action((table, options) => {
            const AWS = require('./aws').init(options);
            const dynamo = new AWS.DynamoDB({ region: options.region || "eu-west-1" });
            const printer = new Printer(options);

            dynamo.describeTable({ TableName: table }, printer.printResponse());
        });
};
