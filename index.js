'use strict;'

var Agent = require('./agent');

// establish problem : calculate 42
var target = 42;
var evolving = true;
var trait = "";
var count = 0;

while(evolving) {

	// assign agents
	var agents = [];
	for(var i=0; i<3; i++) {
		agents.push(new Agent(trait));
		try {
			agents[i].solution = eval(agents[i].equation);
		} catch(e) {
			agents[i].solution = 0;
		}
	}

	// pick the winner
	function closest(num, arr){
	    var curr = arr[0];
	    var index = 0;
	    arr.forEach((agent, i)=>{
	    	if (Math.abs(num - agent.solution) < Math.abs(num - curr.solution)) {
	            curr = agent.solution;
	            index = i;
	    	}
	    })
	        
	    return index;
	}

	var index = closest(target, agents);

	agents.forEach((agent, i)=>{
		console.log("equation", agent.equation);
		console.log("solution", agent.solution);
	});

	console.log("Best result was " + agents[index].equation + " = " + agents[index].solution);

	if(agents[index].solution == target) {
		evolving = false;
	}

	if(agents[index].solution) {
		trait += agents[index].equation;
		//console.log("trait", trait);
	}

	count++;
	console.log("count " + count);
}
