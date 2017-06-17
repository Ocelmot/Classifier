const Classifier = require('./classifier');

const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');

var train_file = path.join(__dirname, 'data', 'Quora', 'train.csv');
var test_file = path.join(__dirname, 'data', 'Quora', 'test.csv');


function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

var slice_index = 300000;
console.log('loading training data');
var train_data = parse(fs.readFileSync(train_file, 'utf-8'));
var test_data1 = train_data.slice(slice_index);
train_data = train_data.slice(0, slice_index);
// console.log('loading testing data');
// var test_data2 = parse(fs.readFileSync(test_file, 'utf-8'));
console.log('data loaded');


console.log('training');
var classifier = Classifier();
for (var i = train_data.length - 1; i >= 0; i--) {

	if((train_data.length - i)% 1000 == 0){
		console.log('trained', train_data.length - i, 'of', train_data.length);
	}
	
	
	var words = {};
	var first_question = train_data[i][3].split(' ');
	var second_question = train_data[i][4].split(' ');

	for(var word of first_question){
		words[word] = 1;
	}
	for(var word of second_question){
		if (words[word] === 1){
			words[word] = 2;
		}else{
			words[word] = 1;
		}
	}

	var evidence = classifier.Evidence();
	evidence.setCategory((train_data[i][5]==1)?'same':'diff');
	for(var word in words){
		if (words[word] == 2){
			evidence.add('same:'+word);
		}
		if (words[word] == 1){
			evidence.add('diff:'+word);
		}
	}

	// console.log(train_data[i]);
	// console.log(evidence.get());

	//return;
	classifier.train(evidence);
}


console.log('training complete');
console.log('testing classification model');
var correct = 0;

for (var i = test_data1.length - 1; i >= 0; i--) {

	if((test_data1.length - i)% 100 == 0){
		console.log('tested', test_data1.length - i, 'of', test_data1.length);
	}
	
	
	var words = {};
	var first_question = test_data1[i][3].split(' ');
	var second_question = test_data1[i][4].split(' ');

	for(var word of first_question){
		words[word] = 1;
	}
	for(var word of second_question){
		if (words[word] === 1){
			words[word] = 2;
		}else{
			words[word] = 1;
		}
	}

	var evidence = classifier.Evidence();
	for(var word in words){
		if (words[word] == 2){
			evidence.add('same:'+word);
		}
		if (words[word] == 1){
			evidence.add('diff:'+word);
		}
	}

	var classification = classifier.classify(evidence);
	if (classification == 'same' && test_data1[i][5] == 1) {
		correct ++;
	}
	if (classification == 'diff' && test_data1[i][5] == 0) {
		correct ++;
	}
}


console.log(correct, 'of', test_data1.length);










return;


fs.readFile(filename, {encoding: 'utf-8'}, function(err,data){
	if (err) {console.log('error', err);return;}
	csv_parse(data, function(err, data){
		//console.log(data.length);
		var classifier = Classifier();

		data = data.slice(1);

		shuffle(data);

		var train_count = 5000;
		var test_count = 1000;

		var train_data = data.slice(0, train_count);
		var test_data = data.slice(train_count);

		for(var row of train_data){
			//row = train_data[row];
			console.log('Training on ', row[1]);
			var evidence = classifier.Evidence();
			evidence.setCategory(row[0]);
			//console.log(row);
			var e = row[1];
			//e = e.toLowerCase();
			e = e.replace(/['’]/g, '');
			e = e.replace(/[,.!?"&%(—)/;”“+0-9-]/g, ' ');

			var words = e.split(' ');
			for(var word of words){
				evidence.add(word);
			}
			classifier.train(evidence);

		}
		var mistakes = [];
		var correct = 0;
		var total = 0;
		for(var row of test_data){
			total++;
			var evidence = classifier.Evidence();
			//evidence.setCategory(row[0]);
			var e = row[1];
			//e = e.toLowerCase();
			e = e.replace(/['’]/g, '');
			e = e.replace(/[,.!?"&%(—)/;”“+0-9-]/g, ' ');

			var words = e.split(' ');
			for(var word of words){
				evidence.add(word);
			}
			var cat = classifier.classify(evidence);
			console.log('Classifying', row[1], 'as', cat);

			if (cat == row[0]){
				correct++;
			}else{
				row.evidence = evidence;
				mistakes.push(row);
			}
		}
		console.log(correct, 'of', total);
		console.log((correct/total)*100, 'Percent correct');
		//console.log(mistakes);
		//classifier.classify(mistakes[0].evidence, true);
	});

});



