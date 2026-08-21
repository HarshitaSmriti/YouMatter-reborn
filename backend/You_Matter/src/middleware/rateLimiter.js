import rateLimit from "express-rate-limit";

//  General limiter (for all APIs)
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // max 100 requests per IP
    message: {
        error: "Too many requests, please try again later"
    }
});

//  Strict limiter (for sensitive routes like crisis)
export const strictLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 10,
    message: {
        error: "Too many requests (sensitive route)"
    }
});

//  Chat limiter (for AI messaging)
export const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 40, // max 40 requests per minute
    message: {
        error: "Slow down a bit! You are sending messages too fast. Take a gentle breath and try again in a minute."
    }
});