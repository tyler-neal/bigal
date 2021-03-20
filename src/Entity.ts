import type { CreateUpdateParams } from './types';

export type EntityFieldValue = boolean[] | Date | number[] | Record<string, unknown> | string[] | boolean | number | string | unknown | null;

export abstract class Entity {
  public abstract id: unknown;
}

export interface EntityStatic<T extends Entity> {
  // NOTE: Static methods are generalized with `any` instead of `T` to get around Typescript's challenges of overriding
  // static methods in subclasses. See Typescript #4628
  /* eslint-disable @typescript-eslint/no-explicit-any */
  beforeCreate?: (values: CreateUpdateParams<any>) => CreateUpdateParams<any> | Promise<CreateUpdateParams<any>>;
  beforeUpdate?: (values: CreateUpdateParams<any>) => CreateUpdateParams<any> | Promise<CreateUpdateParams<any>>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  new (): T;
}
