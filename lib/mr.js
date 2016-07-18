#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cli = require('commander')
    .version(require("../package.json").version)
    .option("-f, --format <format>", "The output format (raw, json or yaml)", /^(raw|json|yaml)$/i)
    .option("-r, --region [region]", "AWS region - defaults to 'eu-west-1'")
    .option("--ugly", "Turn off prettification");

const registerCommands = (cli, dir) =>
    fs.readdirSync(dir)
        .forEach((file) => {
            const filePath = path.join(dir, file);

            if (file.slice(0, 3) === "mr-") {
                require(filePath.toString())(cli);
            }
        });

registerCommands(cli, __dirname);
cli.command("help", "Display this help", { isDefault: true })
    .action(cli.help);
cli.parse(process.argv);
