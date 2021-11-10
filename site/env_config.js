
const fs = require('fs');
var properties = new Object();
fs.readFile('config.txt', 'utf8', function (err, contents) {
    // console.log(contents);
    var properties = JSON.parse(contents);
});

function getProp() {
    return properties;
}