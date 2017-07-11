const Stats = require('./stats');
var columnify = require('columnify');
module.exports = function(){
	var epsilon = Stats.epsilon;


	var evidence_index = {};
	var evidence_array = [];

	var category_index = {};
	var category_array = [];

	var all_total=0;


	function createCategory(category){
		var c_index = category_index[category];
		if (category_array[c_index] == null){
			category_array.push({
				name: category,
				total: 0,
				evidence: Array(evidence_array.length).fill(0)
			});
			category_index[category] = category_array.length-1;
			return category_array.length-1;
		}
		return c_index;
	}
	function addEvidence(evidence){
		var e_index = evidence_index[evidence];
		if (e_index == null){
			evidence_array[evidence_array.length] = evidence;
			//evidence_array.push(evidence);
			evidence_index[evidence] = evidence_array.length-1;
			for (var i = category_array.length - 1; i >= 0; i--) {
				category_array[i].evidence[category_array[i].evidence.length] = 0;
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
		var c_index  = category_index[category];
		if(c_index == null){
			c_index = createCategory(category);
		}
		all_total++;
		category_array[c_index].total++;

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
			category_array[c_index].evidence[e_index]++;
			// if (category_array[c_index].evidence[e_index]){
			// 	category_array[c_index].evidence[e_index]++;
			// }else{
			// 	category_array[c_index].evidence[e_index] = 0;
			// }
			
		}
	}

	function classify(evidence, debug = false){



		var max_prob = Number.NEGATIVE_INFINITY;
		var max_cat;
		var total_probability = 0;

		//var probs = [];

		for (var i = category_array.length - 1; i >= 0; i--) {
			//var c = category_array[i];
			//console.log('Testing Category:', category_array[i].name);
			var prob = probability_for_category(category_array[i], evidence, debug);
			//console.log('probability for', category_array[i].name, 'is', prob);
			//probs[c] = prob;
			total_probability += Math.exp(prob);
			if(prob > max_prob){
				//console.log('found max');
				max_prob = prob;
				max_cat = category_array[i].name;
			}
		}

		// for(var c in categories){
		// 	console.log('Testing Category:', c);
		// 	var prob = probability_for_category(c, evidence, debug);
		// 	console.log('probability for', c, 'is', prob);
		// 	probs[c] = prob;
		// 	if(prob > max_prob){
		// 		//console.log('found max');
		// 		max_prob = prob;
		// 		max_cat = c.name;
		// 	}

		// };
		// if (debug){
		// 	var sort_category = 'ham';
		// 	var debug_data = Object.values(debug_evidence);
		// 	debug_data.sort(function(a, b){
		// 		return b[sort_category] - a[sort_category];
		// 	});

		// 	debug_data.push({Observation: 'Total', ham: probs['ham'], spam: probs['spam'],});

		// 	console.log(columnify(debug_data));
		// 	console.log(evidence.get());
		// }

		//console.log('total_probability', total_probability);
		return {category:max_cat, probability:Math.exp(max_prob)/total_probability};
	}

	function probability_for_category(category, evidence, debug = false){
		var prob = 0;
		//var cat = categories[category];

		if (category == null) {
			console.warn('Category', category, 'does not exist');
			return 0;
		}

		for (var i = evidence_array.length - 1; i >= 0; i--) {


			var row_prob = (category.evidence[i]+epsilon) / (category.total+(2*epsilon));
			if (evidence.has(evidence_array[i])) {
				prob += Math.log(row_prob);
			}else{
				prob += Math.log(1-row_prob);
			}
		}

		return prob - Math.log(category.total/all_total);
	}

	var exceptions = {};
	var evidence_filter = function(a){return a;};
	function evidence(){
		var cat = null;
		var evi = {};
		function add(observation){
			observation = evidence_filter(observation);
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
	function setEvidenceFilter(funct){
		evidence_filter = funct;
	}
	function dump_evidence(){
		for (var i = evidence_array.length - 1; i >= 0; i--) {
			console.log(evidence_array[i]);
		}
	}
	return {
		Evidence: evidence,
		train: train,
		classify: classify,
		setEvidenceFilter: setEvidenceFilter,
		dump_evidence: dump_evidence
	};
}
