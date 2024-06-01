import { Router } from "express"; 
import {
    calculatorController
} from '../controllers/calculator.controller.js';

const router = Router();

router.route('/numbers/:numberId').get(calculatorController) ;

export default router;