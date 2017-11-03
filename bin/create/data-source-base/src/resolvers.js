export default {
  Query: {
    example{{properCase name}}Query: (root, args, model) => model.get{{properCase name}}ExampleQuery(),
  },
};
