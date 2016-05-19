var generators = require('yeoman-generator');

module.exports = generators.Base.extend({
    prompting: function () {
        return this.prompt([
            {
                type: 'confirm',
                name: 'auto_bpn',
                message: 'Would you like to auto generate bpn?',
            },
            {
                type: 'input',
                name: 'bpn',
                message: 'What should be customer\'s bpn?',
                when: function (answers) {
                    return !answers.auto_bpn;
                }
            },
            {
                type: 'confirm',
                name: 'auto_partyId',
                message: 'Would you like to auto generate partyId?',
            },
            {
                type: 'input',
                name: 'partyId',
                message: 'What should be customer\'s partyId?',
                when: function (answers) {
                    return !answers.auto_partyId;
                }
            }
        ]).then(function (answers) {
            
            // log answers
            this.log('bpn', answers.bpn || (answers.bpn = '3000872146')); // TODO auto generate bpn
            this.log('partyId', answers.partyId || (answers.partyId = 'A_2393809')); // TODO auto generate partyId
            
            // create configuration from answers to generate customer's data
            this.fs.writeJSON('customers/' + answers.bpn + '.json', answers);

            // create customer data files
            this.fs.copyTpl(
                this.templatePath('template1.xml'),
                this.destinationPath('data/' + answers.bpn + '.xml'),
                answers
            );
        }.bind(this));
    }
});
