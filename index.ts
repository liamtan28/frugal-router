import dotenv from 'dotenv';
import express, { Express } from 'express';
import Router from 'lib/Router';
import logger from 'morgan';
import 'reflect-metadata';

// Load config before any local modules import. This will ensure that each module has access
// the the envvars
dotenv.config();

import env from '@env';
import DefaultController from 'controllers/DefaultController';

const app: Express = express();

/*********************************************
 * Bootstrap middleware
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/********************************************
 * Register controllers
 */
const router: Router = new Router();
router.register(DefaultController);
/*********************************************
 * Bootstrap router
 */
app.use(router.middleware());

const listenSuccess = () =>
  console.log(
    '\n ============================\n',
    'FRUGAL ROUTING\n',
    'Node + Express + TS <3\n',
    'Authored by Liam Tan\n',
    `Visit http://localhost:${env.PORT}\n`,
    '============================\n'
  );

app.listen(env.PORT, listenSuccess);
