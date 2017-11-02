const path = require('path');

module.exports = plop => {
  plop.setGenerator('source', {
    description: 'GrAMPS Data Source',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Data Source name?',
      },
      {
        type: 'list',
        name: 'sourceType',
        choices: [
          { name: 'Wraps REST endpoints', value: 'rest' },
          { name: 'Other', value: 'base' },
        ],
        message: 'Which describes your data source best?',
      },
      {
        type: 'input',
        name: 'url',
        message: 'What is the base url being wrapped?',
        when: ({ sourceType }) => sourceType === 'rest',
      },
    ],
    actions: ({ sourceType }) => [
      {
        type: 'addMany',
        destination: process.cwd() + '/data-source-{{dashCase name}}',
        base: 'common-files',
        templateFiles: 'common-files/**/*',
      },
      {
        type: 'addMany',
        destination: process.cwd() + '/data-source-{{dashCase name}}',
        base: `data-source-${sourceType}`,
        templateFiles: `data-source-${sourceType}/**/*`,
      },
    ],
  });
};
