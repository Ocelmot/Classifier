module.exports.epsilon = 0.000000000000001;

module.exports.clip = function(lower, test, upper){
	return test < lower ? lower : test > upper ? upper : test;
}

module.exports.log_loss = function (prediction, reality){
	var p = module.exports.clip(module.exports.epsilon, prediction, 1-module.exports.epsilon);
	if (reality == 1) {
		return -Math.log(p);
	}else{
		return -Math.log(1-p);
	}
}