import express, { Request, Response } from "express";
import errors from "./errors";

export class Dashboard {
  init() {
    const app = express();
    const port = 3000;

    app.get("/errors", errors);
    app.get("/", (_: Request, res: Response) =>
      res.send('<a href="/errors">Errors</a>')
    );

    app.listen(port, () =>
      console.log(`Dashboard listening at http://localhost:${port}`)
    );
  }
}
