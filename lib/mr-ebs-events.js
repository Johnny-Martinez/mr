#!/usr/bin/env node

const Printer = require('./printer');
require('colors');

const printSeverity = (severity) => {
    switch (severity) {
        case "WARN": return severity.yellow;
        case "INFO": return severity.cyan;
        case "ERROR": return severity.red;
        case "FATAL": return severity.red.bold;
        default: return severity.grey;
    }
};

const action = (environment, options, callback) => {
    const AWS = require('./aws').init(options);
    const EBS = new AWS.ElasticBeanstalk();
    const printer = new Printer(options);

    EBS.describeEvents({ EnvironmentName: environment, MaxRecords: options.number || 10 }, printer.printResponse((data) => {
        data.Events.forEach((event) => console.log("[" + printSeverity(event.Severity) + "] " + event.Message));

        if (callback) callback();
    }));
};

const command = (program) => {
    program
        .command('ebs-events <environment>')
        .option("-n, --number [number]", "Number of events - defaults to 10")
        .description("Pull back details of the elastic beanstalk(s) for the specified service.")
        .action(action);
};

exports.action = action;
exports.command = command;
