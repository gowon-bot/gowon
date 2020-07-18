import { Request, Response } from "express";
import view from "./view";

export default function (_: Request, res: Response) {
  view().then((views) => {
    res.send(views);
  });
}
