import {Request, Response, NextFunction} from "express"
import user from "../auth/auth.router"
import todo from "../todo/todo.router"

export const logger = function (req: Request, res: Response, next: NextFunction) {
  console.log('logging')
  console.log(`${req.method} ${req.path}`)
   // GET /todos endpoint
  next()
}

// app.use(logger)

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })


// logger