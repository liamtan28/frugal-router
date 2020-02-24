/**
 * Controller Class decorator responsible for initialising metadata on the controller class.
 * Defines the prefix to route all subsequent paths declared on the controller methods
 */
export default (prefix: string = ''): ClassDecorator => {
  return (target: any) => {
    // Since this will only be called once, we define the prefix on the target here.
    // as well as status codes
    Reflect.defineMetadata('prefix', prefix, target);

    // Initialise the routes on the target controller so that we can push values into
    // it with the Method Decorators
    if (!Reflect.hasMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }
  };
};
