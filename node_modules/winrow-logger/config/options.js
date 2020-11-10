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
    debug: 'italic blue',
    warn: 'italic yellow',
    data: 'magenta',
    info: 'bold green',
  }
};

module.exports = config;