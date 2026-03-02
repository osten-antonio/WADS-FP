import type { Application, Request, Response } from 'express';


const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app: Application = express();
const port = 3000;


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WADS-FP calculator',
      version: '1.0.0',
    },
  },
  apis: ['./src/index.ts'], 
};

const openapiSpecification = swaggerJsdoc(options);


app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
