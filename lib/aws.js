const R = require('ramda');

exports.init = (options) => {
    const AWS = require('aws-sdk');
    const credentials = new AWS.SharedIniFileCredentials({ profile: options.parent.environment });

    AWS.config.credentials = credentials;
    AWS.config.region = options.parent.region || "eu-west-1";

    AWS.dynamo = {
        getById: (table, id, callback) => {
            const dynamo = new AWS.DynamoDB();

            dynamo.describeTable({ TableName: table }, function (err, data) {
                if (!data) {
                    console.log("Table not found.");
                    return;
                }

                dynamo.getItem({
                    TableName: table,
                    Key: R.assoc(data.Table.KeySchema[ 0 ].AttributeName, { S: id }, {})
                }, callback);
            });
        },
        scan: (table, filter, callback) => {
            const dynamo = new AWS.DynamoDB();
            var params = {
                TableName: table,
                Limit: 10
            };

            if (filter) {
                const kvPairs = filter.split(",");
                params = R.merge(params, {
                    FilterExpression: kvPairs.map(function (kvPair, index) {
                        var pair = kvPair.split("=");
                        return "#key" + index + " = :" + pair[ 0 ];
                    }).join(" AND "),
                    ExpressionAttributeNames: kvPairs.reduce(function (accumulated, kvPair, index) {
                        var pair = kvPair.split("=");
                        return R.assoc("#key" + index, pair[ 0 ], accumulated);
                    }, {}),
                    ExpressionAttributeValues: kvPairs.reduce(function (accumulated, kvPair) {
                        var pair = kvPair.split("=");
                        return R.assoc(":" + pair[ 0 ], { S: pair[ 1 ] }, accumulated);
                    }, {})
                });
            }

            dynamo.scan(params, callback);
        }
    };

    return AWS;
};
