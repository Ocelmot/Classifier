# Classifier

Classifier is a simple naive Bayes classifier module for Node.

## Getting started
To install
``` bash
npm install --save https://github.com/Ocelmot/Classifier.git
```
To require
``` js
const Classifier = require('Classifier');
```
	
## Usage
### Initialization
First generate a classifier instance like so.
``` js
var c = Classifier();
```
### Generate Evidence
Once you have a classifier instance you need to start feeding it evidence.
In order to do this you must create an evidence object.
``` js
var e = c.Evidence();
```
You can add information to the evidence object with the add method.
``` js
e.add('sale');
```
### Training the Classifier
If you are training the classifier, you must also add the category to the evidence.
``` js
e.setCategory('spam');
```
To train the classifier, pass the evidence object to the classifier's train method.
``` js
c.train(e);
```

### Classify Evidence
Once you have finished training the classifier, you can classify evidence by passing it to the classifier's classify method.
``` js
var result = c.classify(e);
console.log(result)
```
The classify method returns the category name as a string.

## Misc
* You may repeat the evidence creation, training, and classification as many times as you need.
* You may create multiple classifiers, they will train and classify independently.
* The classifier will automaticly add categories as it sees evidence of them.
