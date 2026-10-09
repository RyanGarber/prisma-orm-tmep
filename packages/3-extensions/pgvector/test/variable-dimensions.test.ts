import {
  instantiateAuthoringTypeConstructor,
  validateAuthoringHelperArguments,
} from '@internal/framework-components/authoring';
import { renderSqlTypeName } from '@internal/sql-contract/data-type';
import { describe, expect, it } from 'vitest';
import { pgvectorAuthoringTypes } from '../src/core/authoring';
import { pgVectorColumn, pgVectorDescriptor } from '../src/core/codecs';
import { pgvectorVector } from '../src/core/data-types';
import { vector } from '../src/exports/column-types';

describe('variable dimensions', () => {
  it('authors a vector without dimension metadata', () => {
    expect(vector()).toEqual({ codecId: 'pg/vector@1', typeParams: {} });
    expect(pgVectorColumn().typeParams).toEqual({});
  });

  it('authors PSL vectors without a length argument', () => {
    validateAuthoringHelperArguments(
      'pgvector.Vector',
      pgvectorAuthoringTypes.pgvector.Vector.args,
      [],
    );
    expect(
      instantiateAuthoringTypeConstructor(pgvectorAuthoringTypes.pgvector.Vector, []),
    ).toMatchObject({
      codecId: 'pg/vector@1',
    });
  });

  it('validates and renders undimensioned contracts', async () => {
    expect(await pgVectorDescriptor.paramsSchema['~standard'].validate({})).toEqual({ value: {} });
    expect(pgVectorDescriptor.renderOutputType({})).toBe('Vector');
    expect(renderSqlTypeName(pgvectorVector, {})).toBe('vector');
  });

  it('rejects invalid JSON elements without a declared length', () => {
    const codec = pgVectorColumn().codecFactory({ name: 'embedding' });
    for (const value of [[null], ['1'], [Number.POSITIVE_INFINITY], [Number.NaN]]) {
      expect(() => codec.decodeJson(value)).toThrow();
    }
  });

  it('accepts different lengths through every codec path', async () => {
    const codec = pgVectorColumn().codecFactory({ name: 'embedding' });
    for (const value of [[1], [1, 2, 3], [1, 2]]) {
      const wire = `[${value.join(',')}]`;
      expect(await codec.encode(value, {})).toBe(wire);
      expect(await codec.decode(wire, {})).toEqual(value);
      expect(codec.encodeJson(value)).toEqual(value);
      expect(codec.decodeJson(value)).toEqual(value);
    }
  });
});
