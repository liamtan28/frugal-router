export default (code: number): any => (
  target: any,
  propertyKey: string
): void => {
  if (!Reflect.hasMetadata('response_status_codes', target.constructor)) {
    Reflect.defineMetadata(
      'response_status_codes',
      new Map<string, number>(),
      target.constructor
    );
  }
  const statusCodes: Map<string, number> = Reflect.getMetadata(
    'response_status_codes',
    target.constructor
  );
  statusCodes.set(propertyKey, code);
  Reflect.defineMetadata(
    'response_status_codes',
    statusCodes,
    target.constructor
  );
};
