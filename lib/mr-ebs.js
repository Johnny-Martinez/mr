#!/usr/bin/env node

const Printer = require('./printer');
const R = require('ramda');
require('colors');

const printStatus = (status) => {
    switch (status) {
        case "Ready": return status.green;
        default: return status.grey;
    }
};

const action = (environment, options) => {
    const AWS = require('./aws').init(options);
    const EBS = new AWS.ElasticBeanstalk();
    const printer = new Printer(options);

    EBS.describeEnvironmentHealth({EnvironmentName: environment, AttributeNames: ["All"]},
        printer.printResponse((data) => {
            printer.printSeparator();
            printer.printObject({
                Name: data.EnvironmentName.magenta,
                Health: data.HealthStatus[data.Color.toLowerCase()].bold,
                Status: printStatus(data.Status),
                Causes: data.Causes.map((cause) => cause.yellow)
            });
            printer.printSeparator();

            require('./mr-ebs-events').action(environment, R.assoc("number", 20, options), printer.printSeparator);
        }));
};

const command = (program) => {
    program
        .command('ebs <environment>')
        .description("Pull back details of the elastic beanstalk(s) for the specified service.")
        .action(action);
};

exports.action = action;
exports.command = command;