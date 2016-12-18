'use strict;'

class Agent {

	constructor(trait) {
		this.trait = trait;
		this.solve();
 	}

	solve() {
		return this.guess();
	}

	guess(){
	    var text = "";
	    var possible = "+-/*0123456789" + this.trait;
	    var length = this.getNumberBetween(0, 10);

	    for( var i=0; i < 5; i++ ) {
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }

	    this.equation = text;
	    return text;
	}

	getNumberBetween(min,max) {
    	return Math.floor(Math.random()*(max-min+1)+min);
	}

}

module.exports = Agent;