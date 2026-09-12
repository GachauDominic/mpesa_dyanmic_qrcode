import {Request, Response, NextFunction} from "express"

export const logger = function (req: Request, res: Response, next: NextFunction) {
  console.log('logging')
  console.log(`${req.method} ${req.path}`)
  //  GET /`` endpoint
  next()
}