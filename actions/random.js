module.exports = function(list) {
  return function(dbstewardess) {
    console.log(list, list.length);
    dbstewardess.announce(list[Math.floor(Math.random() * list.length)]);
  };
};