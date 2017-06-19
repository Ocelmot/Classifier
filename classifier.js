var columnify = require('columnify');
module.exports = function(){
	var epsilon = 0.00000001;


	var evidence_index = {};
	var evidence_array = [];

	var categories = {};

	// var category_totals = {};
	// var category_evidence = {};

	//var all_evidence = {};
	var all_total=0;


	function createCategory(category){
		if (categories[category] == null){
			categories[category] = {
				name: category,
				total: 0,
				evidence: Array(evidence_array.length).fill(0)
			};
		}
	}
	function addEvidence(evidence){
		var e_index = evidence_index[evidence];
		if (e_index == null){
			evidence_array.push(evidence);
			evidence_index[evidence] = evidence_array.length-1;
			for(var c in categories){
				categories[c].evidence.push(0);
			}
			return evidence_array.length - 1;
		}
		return e_index;
	}

	function train(evidence){
		var category = evidence.getCategory();
		if (category ==  null) {
			console.error('Training with no category');
			return;
		}
		if(categories[category] == null){
			createCategory(category);
		}
		all_total++;
		categories[category].total++;

		var evi = evidence.get();

		for (var i = evi.length - 1; i >= 0; i--) {
			var evidence = evi[i];
			//console.log('Evidence =', evidence);
			var e_index = evidence_index[evidence];
			//console.log('e_index', e_index);
			if (e_index == null) {
				e_index = addEvidence(evi[i]);
			}
			//console.log('e_index2', e_index);
			
			categories[category].evidence[e_index] ++;
		}
	}
	
	function classify(evidence, debug = false){


		
		var max_prob = Number.NEGATIVE_INFINITY;
		var max_cat;

		var probs = {};

		for(var c in categories){
			console.log('Testing Category:', c);
			var prob = probability_for_category(c, evidence, debug);
			console.log('probability for', c, 'is', prob);
			probs[c] = prob;
			if(prob > max_prob){
				//console.log('found max');
				max_prob = prob;
				max_cat = c.name;
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
	}

	function probability_for_category(category, evidence, debug = false){
		var prob = 0;
		var cat = categories[category];

		if (cat == null) {
			console.warn('Category', category, 'does not exist');
			return 0;
		}

// if (category == 'same') {
// 			console.log(cat);
// 		process.exit();
// }

		// console.log(cat);
		// process.exit();


		for (var i = evidence_array.length - 1; i >= 0; i--) {
			

			var row_prob = (cat.evidence[i]+epsilon) / (cat.total+(2*epsilon));
			if (evidence.has(evidence_array[i])) {
				prob += Math.log(row_prob);
			}else{
				prob += Math.log(1-row_prob);
			}
		}

		return prob - Math.log(cat.total/all_total);
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
