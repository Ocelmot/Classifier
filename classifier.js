module.exports = function(){
	var epsilon = 0.0000000000000001;


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
			var e_index = evidence_index[evidence];
			if (e_index == null) {
				e_index = addEvidence(evi[i]);
			}
			category_array[c_index].evidence[e_index]++;
		}
	}

	function classify(evidence, debug = false){
		var max_prob = Number.NEGATIVE_INFINITY;
		var max_cat;

		for (var i = category_array.length - 1; i >= 0; i--) {
			var prob = probability_for_category(category_array[i], evidence, debug);
			if(prob > max_prob){
				max_prob = prob;
				max_cat = category_array[i].name;
			}
		}
		return max_cat;
	}

	function probability_for_category(category, evidence, debug = false){
		var prob = 0;

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
