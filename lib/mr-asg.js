#!/usr/bin/env node

const Printer  = require('./printer');
const R        = require('ramda');
const jsonPath = require('JSONPath').eval;

const action = (service, options) => {
    const AWS         = require('./aws').init(options);
    const EC2         = new AWS.EC2();
    const autoScaling = new AWS.AutoScaling();
    const printer     = new Printer(options);

    EC2.describeInstances({
        Filters: [
            { Name: "tag-key", Values: [ "Name" ] },
            { Name: "tag-value", Values: [ "*" + service + "*" ] }
        ]
    }, function (err, data) {
        const instances   = jsonPath(data, "Reservations[*].Instances[*]");
        const instanceIds = R.pluck("InstanceId", instances);

        if (R.isNil(instances) || R.isEmpty(instances)) {
            console.log("No asgs found.");
            return;
        }

        autoScaling.describeAutoScalingInstances({ InstanceIds: instanceIds }, function (err, data) {
            const asgNames     = jsonPath(data, "AutoScalingInstances[*].AutoScalingGroupName");

            autoScaling.describeAutoScalingGroups({ AutoScalingGroupNames: asgNames },
                printer.printResponse((data) => {
                    const asgs = jsonPath(data, "AutoScalingGroups[*]");

                    printer.printSeparator();
                    asgs.forEach(function (asg) {
                        printer.printObject({
                            Name: asg.AutoScalingGroupName.magenta,
                            LoadBalancers: R.pluck('cyan', asg.LoadBalancerNames),
                            Min: asg.MinSize.toString().yellow,
                            Max: asg.MaxSize.toString().yellow,
                            DesiredCapacity: asg.DesiredCapacity.toString().yellow,
                            HealthCheckType: asg.HealthCheckType.cyan,
                            HealthCheckGracePeriod: asg.HealthCheckGracePeriod.toString().yellow
                        });
                        printer.printSeparator();
                    });
                }));
        });
    });
};

const command = (program) => {
    program
        .command('asg <service>')
        .description("Pull back details of the ASG for the specified service.")
        .action(action);
};

exports.action = action;
exports.command = command;