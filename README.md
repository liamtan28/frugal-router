## frugal-router

Dead-simple declarative routing for Express.

Frugal router provides declarative routing powered by function decorators with a tiny footprint.
Once all is said and done, the Frugal Router object supplies your express application
with a single router that will handle all errors and manage all requests for you.

_NOTE_ this project is work in progress. Eventually this lib will be available as an npm module.

Here's how it works:

Controller:

```
import Controller from 'lib/Controller';
import { Get, Post, Put, Delete, Patch } from 'lib/Methods';
import { Request, Response } from 'express';
import HttpStatus from 'lib/HttpStatus';
import HttpException from 'lib/HttpException';

// use the Controller class decorator to specify the
// base route for the controller.
@Controller('/api')
class DefaultController {
  // Use Get, Put, Post, Patch, and Delete function
  // decorators to define routes. Use HttpStatus
  // to define the default response code.
  @Get('/')
  @HttpStatus(300)
  public indexAction(req: Request) {
    // Return plain JSON and it will be sent as a
    // json response to the client.
    return {
      hello: 'hi!',
    };
  }
  @Get('/:id')
  @HttpStatus(200)
  public idAction(req: Request) {
    return {
      id: req.params.id,
    };
  }
  // All requests reply with a 200 status with the
  // exception of POST requests, which will reply
  // with a 201, if not @HttpStatus function
  // decorator is supplied. Exceptions when
  // in dev mode will be reported to the
  // console.
  @Post('/')
  public postAction(req: Request) {
    throw new HttpException('Forbidden', 403);
  }
  // You can have async actions on your controllers.
  // Rejections from promises will be appropriately
  // handled. You can try this by hitting this
  // route
  @Put('/')
  public async putAction(req: Request) {
    await new Promise((resolve, reject) => reject());
  }
  // While it is not recommended, you do have access the the
  // response object here directly provided by express.
  // you can use this if you wish.
  @Delete('/')
  public deleteAction(req: Request, res: Response) {
    res.json({
      message:
        'Ignore the router and directly access the express response object',
    });
  }
  // When a method returns no response and does not access the
  // express response object directly, a 204 No Content status
  // with an emply payload will be sent to the user. In
  // development mode, you will be presented with a
  // warning when this is the case.
  @Patch('/')
  public patchAction(req: Request, res: Response) {}
}

export default DefaultController;

```

Register your controllers:

```
    import { Router } from "lib/Router";
    const app = express();
    const router = Router();
    router.register(DefaultController);
    app.use(router.middleware());
```

And you're done!
