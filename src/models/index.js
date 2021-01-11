// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Bill } = initSchema(schema);

export {
  Bill
};