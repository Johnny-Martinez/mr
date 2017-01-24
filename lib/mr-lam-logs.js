#!/usr/bin/env node

const Printer = require('./printer');
const jsonPath = require('JSONPath').eval;
const R = require('ramda');

const action = (lambda, options) => {
    const AWS = require('./aws').init(options);
    const Logs = new AWS.CloudWatchLogs();
    const printer = new Printer(options);

    Logs.describeLogStreams({ logGroupName: `/aws/lambda/${lambda}`, descending: true }, (err, data) => {
        if (err) throw new Error(err);

        const latestLogStream = R.head(R.flatten(jsonPath(data, "logStreams")))
        if (latestLogStream) {
            Logs.getLogEvents({ logGroupName: `/aws/lambda/${lambda}`, logStreamName: latestLogStream.logStreamName }, printer.printResponse((data) => {
                data.events.forEach(event => process.stdout.write(event.message))
            }))
        } else {
            console.log("No logs found.")
        }
    });
};

const command = (program) => {
    program
        .command('lam-logs <lambda>')
        .description("Pull back latest log stream for specified lambda.")
        .action(action);
};

exports.action = action;
exports.command = command;
