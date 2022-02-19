export interface CustomArgumentParser<T> {
  parse(message: string): T;
}

export abstract class BaseCustomParser<T> implements CustomArgumentParser<T> {
  abstract parse(message: string): T;
}

export function isCustomParser(value: any): value is CustomArgumentParser<any> {
  return !!value.parse && value.parse instanceof Function;
}
