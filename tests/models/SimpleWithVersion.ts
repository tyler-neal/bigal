import { column, table, versionColumn } from '../../src';

import { ModelBase } from './ModelBase';

@table({
  name: 'simple_with_version',
})
export class SimpleWithVersion extends ModelBase {
  @column({
    type: 'string',
    required: true,
  })
  public name!: string;

  @versionColumn({
    type: 'integer',
    required: true,
  })
  public version!: number;
}
