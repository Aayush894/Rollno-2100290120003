import express from 'express'; 
import cors from 'cors'; 
import cookieParser from 'cookie-parser';  

const app = express(); 

app.use(cors());
app.use(cookieParser());

import calculatorRouter from './routes/calculator.route.js';

app.use("", calculatorRouter);

export { app };