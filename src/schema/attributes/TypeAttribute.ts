import { BaseAttribute } from './BaseAttribute';

export interface TypeAttribute extends BaseAttribute {
  type: 'string' | 'integer' | 'float' | 'date' | 'datetime' | 'boolean' | 'array' | 'json';
  unique?: boolean;
  primaryKey?: boolean;
  defaultsTo?: string | number | boolean | (() => string | number | boolean | Date | object);
  enum?: string[];
}
