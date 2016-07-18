# mr
A simple, opinionated CLI for interrogating AWS.

## Prerequisites
 * nodejs - >= 0.10.41 You might get lucky on earlier 0.10.x releases but, really, why aren't you using node 4+? It's super.
 * git
 * gulp - `npm install -g gulp`
 * AWS keys setup as described here: http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

## Installing
Now you can install `mr` from source:
```sh
git clone git@github.com:kelveden/mr.git
cd mr
npm install
gulp
npm link
```

## Updating
After a fresh update from source, make sure that you run `npm install; gulp`.

## Usage
```sh
mr
```
Note that there's not much in the way of error handling or such niceties so don't be too surprised if you pump shit in and get a smelly water dumped on your screen.

## Help
```sh
mr <command> --help
```
This will print out all the switches available for that command.
