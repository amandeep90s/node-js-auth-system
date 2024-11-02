import { Router } from 'express';
import apiController from '../controller/apiController';
import rateLimit from '../middleware/rateLimit';

const router = Router();

router.use(rateLimit);
router.route('/self').get(apiController.self);
router.route('/health').get(apiController.health);

router.route('/register').post(apiController.register);
router.route('/confirmation/:token').put(apiController.confirmation);

export default router;
