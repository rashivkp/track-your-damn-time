#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var readline = require('readline');
var withConfig = require('./lib/config');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (process.argv[2] === 'log') {
    var log = require('./lib/logData');

    withConfig(rl, function (config) {
        log(config.dataDir, function (err) {
            process.exit(0);
        });
    });

    return;
}

if (process.argv[2] === 'add') {
    withConfig(rl, function (config) {
        var today = moment();
        var filename = makeFilename(today, config.dataDir);

        const handleAdd = function() {
            getTimesFromPrompt(today, function(err, results) {
                if (err) {
                    console.log('Nothing to add');
                    process.exit(1);
                }
                fs.writeFile(filename, results.join('\n') + '\n', function(err) {
                    if (err) throw err;
                    console.log('Tasks added successfully');
                    process.exit(0);
                });
            });
        };

        if (fs.existsSync(filename)) {
            fs.readFile(filename, 'utf8', function(err, data) {
                if (err) throw err;

                rl.question(`There is existing content for today:\n\n${data}\n\nDo you want to replace it? (y/n) `, function(answer) {
                    if (answer.toLowerCase() === 'y') {
                        handleAdd();
                    } else {
                        console.log('Add operation cancelled');
                        process.exit(0);
                    }
                });
            });
        } else {
            handleAdd();
        }
    });
    return;
}

if (process.argv[2] === 'append') {
    withConfig(rl, function (config) {
        var today = moment();
        var filename = makeFilename(today, config.dataDir);

        if (!fs.existsSync(filename)) {
            console.log("No log exists for today yet. Use 'add' instead.");
            process.exit(1);
        }

        getTimesFromPrompt(today, function(err, results) {
            if (err) {
                console.log('Nothing to append');
                process.exit(1);
            }

            // Read existing content and append new tasks
            fs.readFile(filename, 'utf8', function(err, data) {
                if (err) throw err;

                // Add new tasks with a newline separator
                var newContent = data.trim() + '\n' + results.join('\n') + '\n';
                fs.writeFile(filename, newContent, function(err) {
                    if (err) throw err;
                    console.log('Tasks appended successfully');
                    process.exit(0);
                });
            });
        });
    });
    return;
}

withConfig(rl, function (config) {
    checkDatesFrom(moment(config.startDate), config.dataDir, function () {
        process.exit(0);
    });
});

function dataExistsForDate(date, dataDir, done) {
    var p = makeFilename(date, dataDir);
    done(fs.existsSync(p));
}

function getTimesFromPrompt(date, done) {
    var day = humanizeDate(date);
    var answers = [];

    rl.question("What the heck did you do " + day + "? (hours - task) ", function (answer) {
        if (answer.trim() === '') {
            done("None entered");
        } else {
            answers.push(answer);
            getMoreTimes(function (more) {
                if (!Array.isArray(more)) more = [more];
                done(null, answers.concat(more));
            });
        }
    });
}

function getMoreTimes(done) {
    var answers = [];
    rl.question("What else? ", function (answer) {
        if (answer.trim() === '') {
            done([]);
        } else {
            answers.push(answer);
            getMoreTimes(function (more) {
                done(answers.concat(more));
            });
        }
    });
}

function makeFilename(date, dataDir) {
    return path.join(dataDir, date.format("YYYY-MM-DD") + ".txt");
}

function checkAndPopulate(date, dataDir, done) {
    dataExistsForDate(date, dataDir, function (exists) {
        if (exists) return done();

        getTimesFromPrompt(date, function (err, results) {
            if (err) {
                console.log('Nothing entered for', date.toString());
                return done();
            }

            fs.writeFile(makeFilename(date, dataDir), results.join('\n') + '\n', done);
        });
    });
}

function checkDatesFrom(start, dataDir, done) {
    if (start.day() === 0 || start.day() === 6) {
        //console.log(humanizeDate(start), 'was the weekend');
        return checkDatesFrom(start.clone().add({ days: 1 }), dataDir, done);
    }

    //Don't do future things
    if (start.isAfter(moment())) return done();

    //Do today if after 4pm
    if (start.isSame(moment(), 'day') && moment().hour() < 16) return done();

    checkAndPopulate(start, dataDir, function (err) {
        if (err) throw err;
        checkDatesFrom(start.clone().add({ days: 1 }), dataDir, done);
    });
}


function humanizeDate(date) {
    return date.calendar().split(' at ')[0];
}
