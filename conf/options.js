'use strict';

const options = {};

const sequelizeOptions = {
  mysql: 'mysql',
};

const associationsOptions = {
  one_to_many: 'hasMany',
  many_to_many: 'belongsToMany',
};

options.sequelizeOptions = sequelizeOptions;
options.associationsOptions = associationsOptions;

module.exports = options;
