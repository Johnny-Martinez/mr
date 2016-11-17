#!/usr/bin/env node

const Printer = require('./printer');
require('colors');

const action = (environment, options, callback) => {
    const AWS     = require('./aws').init(options);
    const EBS     = new AWS.ElasticBeanstalk();
    const printer = new Printer(options);

    EBS.describeConfigurationSettings({
            EnvironmentName: environment,
            ApplicationName: environment.substring(0, environment.length - 4)
        },
        printer.printResponse((data) => {
            data.ConfigurationSettings[0].OptionSettings
                .filter(({ Namespace }) => Namespace === "aws:elasticbeanstalk:application:environment")
                .forEach(({ OptionName, Value }) => {
                    console.log(OptionName.cyan + ": " + Value.yellow);
                });

            if (callback) callback();
        }));
};

const command = (program) => {
    program
        .command('ebs-vars <environment>')
        .description("Pull back details of the environment vars for the specific elastic beanstalk environment.")
        .action(action);
};

exports.action  = action;
exports.command = command;
