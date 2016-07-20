#!/usr/bin/env node

const Printer = require('./printer');
const R = require('ramda');
const jsonPath = require('JSONPath').eval;

const action = (service, options) => {
    const AWS = require('./aws').init(options);
    const EC2 = new AWS.EC2();
    const printer = new Printer(options);

    EC2.describeInstances({
        Filters: [
            { Name: "tag-key", Values: [ "Name" ] },
            { Name: "tag-value", Values: [ "*" + service + "*" ] }
        ]
    }, printer.printResponse((data) => {
        const instances = jsonPath(data, "Reservations[*].Instances[*]");

        if (R.isNil(instances) || R.isEmpty(instances)) {
            console.log("No instances found.");
            return;
        }

        console.log("IMPORTANT:".yellow + " The healthchecks are only relevant if the ASG is configured with the 'EC2' healthcheck.");
        printer.printSeparator();

        console.log("Instances: " + instances.length);
        printer.printSeparator();

        const instanceIds = R.pluck("InstanceId", instances);

        EC2.describeInstanceStatus({
            InstanceIds: instanceIds,
            IncludeAllInstances: true

        }, function (err, data) {
            if (err) {
                console.error(err);
                return;
            }

            const statuses = jsonPath(data, "InstanceStatuses[*]");

            instances.forEach(function (instance) {
                const instanceStatus = R.pipe(R.filter(R.whereEq({ InstanceId: instance.InstanceId })), R.head)(statuses);
                const data = {
                    Name: R.head(instance.Tags.filter((t) => t.Key === "Name")).Value.magenta,
                    Id: instance.InstanceId,
                    DNS: (instance.PrivateDnsName || "N/A").cyan,
                    IP: (instance.PrivateIpAddress || "N/A").cyan,
                    Launched: instance.LaunchTime.toString().yellow,
                    State: (instance.State.Code === 16 ? instance.State.Name.green : instance.State.Name.red),
                    EC2HealthCheck: instanceStatus.InstanceStatus.Status === 'ok' ? instanceStatus.InstanceStatus.Status.green : instanceStatus.InstanceStatus.Status.red
                };

                if (instance.health) data.Health = (instance.health === 'InService' ? instance.health.green : instance.health.red);

                printer.printObject(data);
                printer.printSeparator();
            });
        });
    }));
};

const command = (program) => {
    program
        .command('ec2 <service>')
        .description("Pull back details of the instances for the specified service.")
        .action(action);
};

exports.action = action;
exports.command = command;