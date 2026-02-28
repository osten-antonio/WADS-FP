import type { Application, Request, Response } from 'express';

const express = require('express');

const app: Application = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
