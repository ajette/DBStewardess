
function flipacoin(dbstewardess) {
    var rand = Math.round(Math.random() * 1);
	if (rand == 0) {
		dbstewardess.announce("Heads!");
	}
	else if (rand == 1) {
		dbstewardess.announce("Tails!");
	}
}

module.exports = flipacoin;