'use strict';

var generators = require('yeoman-generator');
var fs = require('fs');

var newCustomerQuestions = [{
    type: 'confirm',
    name: 'auto_bpn',
    message: 'Would you like to auto generate bpn?'
}, {
    type: 'input',
    name: 'bpn',
    message: 'What should be customer\'s bpn?',
    when: function when(answers) {
        return !answers.auto_bpn;
    }
}, {
    type: 'confirm',
    name: 'auto_partyId',
    message: 'Would you like to auto generate partyId?'
}, {
    type: 'input',
    name: 'partyId',
    message: 'What should be customer\'s partyId?',
    when: function when(answers) {
        return !answers.auto_partyId;
    }
}];

var existingCustomerQuestion = { type: 'input', name: 'file_name', message: 'Enter config file name (without file extension part)' };

var newCustomerGenerationAction = 'Create new customer';
var existingCustomerGenerationAction = 'Generate existing customer\'s data';
var allCustomersGenerationAction = 'Generate all customers';

var configDir = 'customers/';
var dataDir = 'data/';

function makeId(length, chars) {
    var text = "";
    var len = length || 5;
    var possible = chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < len; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

module.exports = generators.Base.extend({
    prompting: function prompting() {
        return this.prompt([{
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: [newCustomerGenerationAction, existingCustomerGenerationAction, allCustomersGenerationAction]
        }]).then(function (answers) {
            var self = this;
            if (answers.action === newCustomerGenerationAction) {
                self.prompt(newCustomerQuestions).then(function (answers) {
                    if (answers.auto_bpn) {
                        answers.bpn = makeId();
                    }
                    if (answers.auto_partyId) {
                        answers.partyId = makeId();
                    }
                    self.fs.copyTpl(self.templatePath(), self.destinationPath(dataDir + answers.bpn), answers);
                    self.fs.writeJSON(configDir + answers.bpn + '.json', answers);
                });

            } else if (answers.action === existingCustomerGenerationAction) {
                self.prompt(existingCustomerQuestion).then(function (answers) {
                    var configObj = self.fs.readJSON(configDir + answers.file_name + '.json');
                    self.fs.copyTpl(self.templatePath(), self.destinationPath(dataDir + configObj.bpn), configObj);
                });
            } else if (answers.action === allCustomersGenerationAction) {
                fs.readdir(configDir, function(err, filenames) {
                    filenames.forEach(function(filename) {
                        fs.readFile(configDir + filename, 'utf-8', function(err, configObj) {
                            configObj = JSON.parse(configObj);
                            self.fs.copyTpl(self.templatePath(), self.destinationPath(dataDir + configObj.bpn), configObj);
                        });
                    });
                });
            } else {
                self.log('This action is not yet implmented, sorry :(');
            }
        }.bind(this));
    }
});
