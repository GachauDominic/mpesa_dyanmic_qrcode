import { RateLimiterMemory } from "rate-limiter-flexible"
import {Request, Response, NextFunction} from "express"

const rateLimiter = new RateLimiterMemory({
  points: 10, // requests allowed 
  duration: 60 //per 60 sec
});

export const rateLimiterMidd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip || "unknown")
    console.log(`Rate limit passed for the IP: ${req.ip}`);
    next()
  } catch (error) {
    res.status(429).json({error: "Too many requests. Try again later"})
  }
} 

export default rateLimiterMidd