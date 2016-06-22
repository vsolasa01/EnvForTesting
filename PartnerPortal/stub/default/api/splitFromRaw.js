var fs = require('fs'),
    util = require('util');


function parseInput() {
    // TODO - alter this file location to use a command line arg
    // Assumes the target json file contains an array of objects of the desired stub response shape for the endpoint.
    var content = fs.readFileSync('raw.json');
    return JSON.parse(content);
}

function writeMembersToFile(array, idSelector) {
    var currContent, currId;
    for (var i = 0; i < array.length; i++) {
        if (idSelector) {
            currId = idSelector(array[i]);
        } else {
            currId = i;
        }
        currContent = 'module.exports = ' + JSON.stringify(array[i], null, 2) + ';';
        fs.writeFileSync('homeowners/' + currId + '.js', currContent);
    }
}

writeMembersToFile(parseInput(), function(m) {
   return m.SunEdCustId;
});