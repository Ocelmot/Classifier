var columnify = require('columnify');
module.exports = function(){
	var epsilon = 0.00000001;


	var evidence = [];

	var category_totals = {};
	var category_evidence = {};
	var all_evidence = {};
	var all_total=0;


	function createCategory(category){
		if (category_totals[category] == null){
			category_totals[category] = 0;
			category_evidence[category] = {};
		}
	}

	
	function train(evidence){
		var category = evidence.getCategory();
		if (category ==  null) {
			console.error('Training with no category');
			return;
		}
		if(category_totals[category] == null){
			createCategory(category);
		}
		all_total++;
		category_totals[category]++;

		var evi = evidence.get();
		for(var e of evi){
			all_evidence[e] = 1;
			if (category_evidence[category][e] == null) {
				category_evidence[category][e] = 1;
			}else{
				category_evidence[category][e]++;
			}
		}
	}
	
	function classify(evidence, debug = false){
		
		// var instances = {};
		// for(e in evidence){
		// 	//console.log(e);
		// 	if(e in priors[0]){
		// 		instances[e] = 1;
		// 	}
		// }
		// //console.log('e', evidence);
		// evidence = Object.keys(evidence);
		

		// debug_evidence = {};
		// total_debug_evidence = {};
		// total_debug_evidence.evidence = 'Total';


		
		var max_prob = Number.NEGATIVE_INFINITY;
		var max_cat;

		var probs = {};

		for(var c in category_totals){
			//console.log(c);
			evidence.setCategory(c);
			var prob = probability_for_class(evidence, debug);
			console.log('probability for', c, 'is', prob);
			probs[c] = prob;
			if(prob > max_prob){
				//console.log('found max');
				max_prob = prob;
				max_cat = c;
			}

		};
		if (debug){
			var sort_category = 'ham';
			var debug_data = Object.values(debug_evidence);
			debug_data.sort(function(a, b){
				return b[sort_category] - a[sort_category];
			});

			debug_data.push({Observation: 'Total', ham: probs['ham'], spam: probs['spam'],});

			console.log(columnify(debug_data));
			console.log(evidence.get());
		}

		
		return max_cat;
		
		// for(var i=0; i<classifications; i++){
		// 	var prob = probability_for_class(evidence, i);
		// 	sum_probs += prob;
		// 	probs.push({category: i+1, probability:prob});
		// 	//console.log('probability of class '+i+' = '+prob);
		// 	if(prob > max_prob){
		// 		max_prob = prob;
		// 		max_cat = i;
		// 	}
		// 	total_debug_evidence[i+1] = prob.toPrecision(4);
		// }

		
		// return max_cat;
	}
	var debug_evidence = {};
	var total_debug_evidence = {};
	function probability_for_class(evidence, debug = false){
		var category = evidence.getCategory();
		var prob = 0;
		var cat = category_evidence[category];
		var cat_total = category_totals[category];

		if (cat == null) {
			console.warn('Category', category, 'does not exist');
			return 0;
		}


		for(var observation in all_evidence){
			if (debug && debug_evidence[observation] == null) {
				debug_evidence[observation] = {Observation: observation};
			}

			var row_prob = ((cat[observation]==null?0:cat[observation])+epsilon)/(cat_total+(2*epsilon));

			if (evidence.has(observation)) {
				prob += Math.log(row_prob);
				if (debug) {
					debug_evidence[observation][category] = Math.log(row_prob);
				}
			}else{
				prob += Math.log(1-row_prob);
				if (debug) {
					debug_evidence[observation][category] = Math.log(1-row_prob);
				}
			}
		}
		return prob - Math.log(cat_total/all_total);
	}
	
	var exceptions = {};
	function evidence(){
		var cat = null;
		var evi = {};
		function add(observation){
			if(observation == null || observation == ''){
				return;
			}
			evi[observation] = 1;
		}
		function has(observation){
			return evi[observation] == 1;
		}
		function get(){
			var except = Object.keys(exceptions);
			for(var e in except){
				delete evi[e];
			}
			return Object.keys(evi);
		}
		function setCategory(category){
			cat = category;
		}
		function getCategory(){
			return cat;
		}

		return {
			add: add,
			get: get,
			has: has,
			setCategory: setCategory,
			getCategory: getCategory
		};
	}
	function addException(exception){
		exceptions[exception] = 1;
	}
	return {
		Evidence: evidence,
		train: train,
		classify: classify
	};
}
