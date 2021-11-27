import express, { Express } from 'express';

import { Console, Database, env } from '@marketplace/shared';
import Router from './app/routes/Routes';

class Server {
  private readonly _server: Express;

  private _dbConnection: Database;

  private _console: Console = new Console('SERVER');

  constructor() {
    this._server = express();
    this._dbConnection = new Database(env.db);
  }

  private applyMiddleware(): void {
    this._console.success('Applying middleware...');
    this._server.use(express.json());
  }

  private setupRoutes(): void {
    this._console.success('Setting up routes ...');
    Router(this._server);
  }

  async init(): Promise<void> {
    try {
      this._console.success('Initializing server...');
      this.applyMiddleware();
      this.setupRoutes();
      await this._dbConnection.createConnection();
      this._console.success('Server initialized');
      this._server.listen(env.api.port, () => {
        this._console.success(`Server is running on port ${env.api.port}`);
      });
    } catch (e) {
      this._console.error((e as Error).message);
    }
  }
}

const server = new Server();
server.init();
