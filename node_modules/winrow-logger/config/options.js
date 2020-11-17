'use strict';

const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
  },
  colors: {
    error: 'bold red cyanBG',
    debug: 'bold blue blackBG',
    warn: 'bold yellow blackBG',
    data: 'bold magenta',
    info: 'underline green',
  }
};

module.exports = config;