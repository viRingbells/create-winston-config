'use strict';

const _               = require('lodash');
const assert          = require('assert');
const path            = require('path');
const winston         = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const DEFAULT_CONFG = {
    level: 'info',
    levels: winston.config.npm.levels,
    path: 'logs',
    logs: ['debug', 'info', 'warn', 'error'],
    datePattern: 'YYYYMMDDHH',
    zippedArchive: false,
    maxFiles: '7d',
    format: null,
};

function create(config = {}) {
    assert(config instanceof Object, 'Invalid type of config, should be an object');
    config = _.defaultsDeep(config, DEFAULT_CONFG);
    const logDirectory = path.resolve(path.dirname(process.mainModule.filename), config.path);
    const transports = [];
    const format = winston.format.simple();
    if (config.format instanceof Function) {
        format = config.format;
    }
    else if ('string' === typeof config.format) {
        format = _.template(config.format);
    }
    config.format = format;
    for (const level of config.logs) {
        if (!config.levels.hasOwnProperty(level)) {
            continue;
        }
        if (config.levels[level] > config.levels[config.level]) {
            continue;
        }
        if (level !== 'debug') {
            transports.push(new DailyRotateFile({
                ...config,
                level,
                filename: path.resolve(logDirectory, level),
            }));
        }
        else {
            transports.push(new winston.transports.Console({
                level: 'debug',
                format: config.format,
            }));
        }
    }

    const logger  = winston.createLogger({
        level: config.level,
        transports
    });

    return logger;
}

module.exports = create;