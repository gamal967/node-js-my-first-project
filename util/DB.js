const Sequelize= require('sequelize');

const sequelize= new Sequelize('node_DB','root','gggmmmlll333',{
  dialect:'mysql',
  host: 'localhost'
});

module.exports = sequelize;