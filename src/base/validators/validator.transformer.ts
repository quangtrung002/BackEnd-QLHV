import { Transform } from 'class-transformer';

interface ITransformerOptions {
  each?: boolean;
}

export function Trim() {
  return Transform(({ value }) => value?.toString().trim());
}

export function ToLowerCase() {
  return Transform(({ value }) => value?.toString().toLowerCase());
}

export function TransformBoolean() {
  return Transform(({ value }) => [true, 'true', 'True', 'TRUE'].includes(value));
}

function TransformBy(method: ((...options) => any), requireType?: string, options?: ITransformerOptions) {
  return Transform(({ value }) => {
    if (options?.each) {
      if (!Array.isArray(value))
        return value;

      try {
        return value.map(v => method(v));
      } catch (e) {
        return null;
      }
    }

    if (requireType && typeof value !== requireType)
      return value;

    try {
      return method(value);
    } catch (e) {
      return null;
    }
  });
}

export function TransformInt(options?: ITransformerOptions) {
  return TransformBy(parseInt, 'string', options);
}

export function TransformSort(sortFields?: string[]) {
  return Transform(({ value }) => {
    if (typeof value !== 'string')
      return value;

    const keys = value.replace(/ /g, '').split(',');
    return keys.reduce((acc, cur) => {
      const key = cur.replace(/^[+-]/, '');

      if (Array.isArray(sortFields) && !sortFields.includes(key))
        return acc;

      acc[key] = RegExp(/^-/).exec(cur) ? 'DESC' : 'ASC';
      return acc;
    }, {});
  });
}
