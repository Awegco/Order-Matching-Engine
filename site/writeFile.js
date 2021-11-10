
const fs = require('fs');
    
   
fs.readFile('config.txt', 'utf8', function(err, contents) {
        console.log(contents);
    });


 