import rateLimit from 'express-rate-limit';

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200, // 200 reqs per 15 mins
  message: { message: 'Too many requests, please try again later' }
});


export const ollamaRateLimit = rateLimit({
  windowMs: 60 * 1000, 
  max: 100,              
  message: { message: 'AI request limit reached, please wait' }
});


export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,                   
  message: { message: 'Too many attempts, please try again later' }
});