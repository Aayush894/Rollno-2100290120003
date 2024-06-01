import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 9876;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
