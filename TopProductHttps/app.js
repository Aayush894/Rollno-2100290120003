import express from 'express'; 
import cors from 'cors'; 
import cookieParser from 'cookie-parser';  

const app = express(); 

app.use(cors());
app.use(cookieParser());

import productRouter from './routes/product.route.js';

app.use("", productRouter);

export { app };