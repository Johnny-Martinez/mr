#!/usr/bin/env node

const Printer  = require('./printer');
const R        = require('ramda');
const jsonPath = require('JSONPath').eval;

module.exports = function (program) {
    program
        .command('elb <service>')
        .description("Pull back details of the elb(s) for the specified service.")
        .action((service, options) => {
            const AWS     = require('./aws').init(options);
            const ELB     = new AWS.ELB();
            const printer = new Printer(options);

            ELB.describeLoadBalancers({
                    Filters: [
                        { Name: "tag-key", Values: [ "Name" ] },
                        { Name: "tag-value", Values: [ "*" + service + "*" ] }
                    ]
                },
                printer.printResponse((data) => {
                    const elbs = jsonPath(data, "LoadBalancerDescriptions[*]");

                    if (R.isNil(elbs) || R.isEmpty(elbs)) {
                        console.log("No balancers found.");
                        return;
                    }

                    printer.printSeparator();

                    elbs.forEach(function (elb) {
                        printer.printObject({
                            Name: elb.LoadBalancerName.cyan,
                            DNS: elb.DNSName.cyan,
                            Created: elb.CreatedTime.toString().yellow,
                            Instances: elb.Instances.length.toString().green
                        });

                        printer.printSeparator();

                        console.log("IMPORTANT:".yellow + " The following healthchecks are only relevant if the ASG is configured with the 'ELB' healthcheck.");

                        ELB.describeInstanceHealth({ LoadBalancerName: service }, function (err, data) {
                            var statuses = jsonPath(data, "InstanceStates[*]");

                            statuses.forEach(function (status) {
                                printer.printObject({
                                    Id: status.InstanceId.magenta,
                                    ELBHealthCheck: (status.State === 'InService' ? status.State.green : status.State.red),
                                    ReasonCode: status.ReasonCode.cyan,
                                    Description: status.Description.cyan
                                });

                                printer.printSeparator();
                            });
                        });

                        printer.printSeparator();
                    });
                }));
        });
};
