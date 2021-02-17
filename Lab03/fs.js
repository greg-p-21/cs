var fs = require('fs')
var readline = require('readline');

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

rl.on('line', function (line) {
	console.log(`he wrote ${line}`);
});

function appendToFile(file, data) {
	fs.appendFile(file, data, function (err) {
		if (err) console.log("ERROR writing " + data + ":" + err);
	});
}

function writeToFile(file, data) {
	fs.writeFile(file, data, function (err) {
		if (err) console.log("ERROR writing " + data + ":" + err);
	});
}

function readFromFile(file) {
	fs.readFile(file, function (err, data) {
		if (err) throw err;
		console.log(data.toString());
	});
}