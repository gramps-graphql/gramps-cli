import { MockList } from 'graphql-tools';
import casual from 'casual';

export default {
  Query: () => ({
    example{{properCase name}}Query: casual.sentence,
  }),
};
