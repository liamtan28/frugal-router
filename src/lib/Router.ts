import { Router as ExpressRouter, Request, Response } from 'express';
import { RouteDefinition, EHttpMethod } from 'models/transport';
import HttpException from './HttpException';

/**
 * The bread and butter Router class, responsible for reading all metadata
 * defined by controllers and their methods, and appropriately setting
 * up the vanilla express router to behave as expected
 */
class Router {
  // This value is returned and provided to the app once all metadata has
  // been appropriately converted to route handlers here
  private router: ExpressRouter;
  public constructor() {
    this.router = ExpressRouter();
  }
  /**
   * the register method is responsible for binding controllers to the
   * router. This is acheived by stripping the metadata from controllers
   * and creating tangible routes defined on the express router.
   */
  public register(controller: any): void {
    // Create an instance of the controller class supplied as an
    // argument.
    const instance: any = new controller();

    // Extract the prefix and routes defined in the
    // controller metadata from the controller, as
    // well as the status code map
    const prefix: string = Reflect.getMetadata('prefix', controller);
    const statusCodes: Map<string, number> = Reflect.getMetadata(
      'response_status_codes',
      controller
    );
    const routes: Array<RouteDefinition> = Reflect.getMetadata(
      'routes',
      controller
    );
    // For each provided route, a handler must be defined on the express router
    // according to the specified behaviour in the metadata of the controller.
    // We can expect this route metadata to be supplied in the form of a
    // RouteDefinition interface
    routes.forEach((route: RouteDefinition): void => {
      // the whole path for this route, according to the prefix defined on
      // the Controller class decorator, and the path specified by the
      // method decorator
      const path: string = prefix + route.path;
      // given an example GET Request on the path api/user, this
      // statement will evaluate as:
      // this.router.get('api/user', (req, res) => /* handler */);
      this.router[route.requestMethod](
        path,
        async (req: Request, res: Response): Promise<void> => {
          // A top level try/catch control statement is defined so that
          // any exceptions raised explicitly (HttpException), or any
          // unknown exception can be handled safely. The top level
          // function is async, and the response from the controller
          // method is awaited in case it is async and thus
          // returns a promise, meaning that any promise
          // with an uncaught rejection will also be
          // appropriately caught here.
          try {
            // Provide the specified method with both the Request and
            // Response express objects so that it may access any
            // info required. This library simply provides a
            // declarative way to construct routes and
            // controllers and thus does not interfere
            // with the Request and Response express
            // objects.
            const response: any = await instance[route.methodName](req, res);
            // In the example that the controller method returned no data, but
            // the response object was accessed directly and thus has finished
            // replying to the client, return early as no more has to be done.
            if (!response && res.finished) return;
            // If the response is empty, but there has been no response sent,
            // instead call the sendNoData method and reply with a 204
            // No Content. Warn the developer in dev mode as this was
            // likely a mistake.
            else if (!response && !res.finished)
              return this.sendNoData(route, controller, res);
            // Generate the statusCode to reply with. If the method name
            // has a status code specified by the HttpStatus function
            // decorator, use that one. If none was specified, and
            // a default must be used, use 201 for POST requests,
            // and 200 for all others.
            const statusCode: number =
              (statusCodes ? statusCodes.get(route.methodName) : null) ||
              (route.requestMethod == EHttpMethod.POST ? 201 : 200);
            // If we have reached the end of the control statement, the response
            // is ready to be sent. Specify the status code and respond to the
            // client with the response from the controller method.
            res.status(statusCode).json(response);
          } catch (error) {
            // If the error thrown was an HttpException from the
            // library provided, then appropriately throw that
            // error and send it to the user. If not, then
            // call the handleUnknownException method and
            // deal with it appropriately
            if (error instanceof HttpException) {
              const response: {
                error: string;
                status: number;
              } = error.getError();
              res.status(response.status).json(response);
            } else {
              this.handleUnknownException(route, controller, res);
            }
          }
        }
      );
    });
  }
  /**
   * middleware getter for the internal router. To be used in application bootstrap
   * where appropriate. Also maps the last route, which is the 404 no match route.
   */
  public middleware(): ExpressRouter {
    this.router.use(this.notFoundHandler);
    return this.router;
  }
  /**
   * not found handler. Will be called when no route matches. Simply
   * raises a 404 and sends it to the user.
   */
  private notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
      error: 'Not Found',
      status: 404,
    });
    // No need for NextFunction here as uncaught errors are dealt
    // with in the register function above.
  }
  /**
   * sendNoData method
   *
   * This method is called when a route has not returned any payload, and when
   * it has also not accessed the response object from express directly and
   * sent a request.
   */
  private sendNoData(
    route: RouteDefinition,
    controller: any,
    res: Response
  ): void {
    // Warn the user here that no data has been returned from the controller method.
    // It is important to do so as this is likely a mistake.
    console.warn(
      ` * Warning - Method returned no response: ${
        controller.toString().split(' ')[1]
      }\n`,
      `* Route:                                 ${Reflect.getMetadata(
        'prefix',
        controller
      ) + route.path}\n`,
      `* Controller method name:                ${route.methodName}\n`,
      `* HTTP method type:                      ${route.requestMethod}\n`
    );
    // Send 204 No Content.
    res.status(204).send();
  }
  /**
   * handleUnknownException method, returning 500 when no HttpException was explicitly
   * raised. This could be caused by an unhandled promise rejection, or a custom error
   * thrown either internally or from an external module.
   */
  private handleUnknownException(
    route: RouteDefinition,
    controller: any,
    res: Response
  ): void {
    // Notify the user of the error, including all metadata associated with the
    // request.
    console.error(
      ` * Error - Unknown exception thrown: ${
        controller.toString().split(' ')[1]
      }\n`,
      `* Route:                    ${Reflect.getMetadata('prefix', controller) +
        route.path}\n`,
      `* Controller method name:   ${route.methodName}\n`,
      `* HTTP method type:         ${route.requestMethod}\n`
    );
    // Return a 500 error to the user.
    res.status(500).json({
      error: 'Internal Server Error',
      status: 500,
    });
  }
}

export default Router;
