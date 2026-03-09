import express, { type Application, type Request, type Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app: Application = express();
const port = 8000;


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WADS-FP Calculator',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts', './src/index.ts'], 
};

const openapiSpecification = swaggerJsdoc(options);


app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
