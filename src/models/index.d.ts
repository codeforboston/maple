import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Bill {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly dateIntiated?: number;
  readonly supporter?: string;
  constructor(init: ModelInit<Bill>);
  static copyOf(source: Bill, mutator: (draft: MutableModel<Bill>) => MutableModel<Bill> | void): Bill;
}