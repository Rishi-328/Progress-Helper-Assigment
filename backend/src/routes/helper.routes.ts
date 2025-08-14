import express from 'express';
import uploadHelperFiles from '../middlewares/upload.middleware';
import { createHelper, getCount } from '../controllers/helper.controller';
import { getHelpers,getHelperById,deleteHelper,updateHelper} from '../controllers/helper.controller';

const router = express.Router();

router.post('/add',uploadHelperFiles,createHelper);

router.post('/getAll',getHelpers);

router.get('/getCount',getCount);

router.get('/get/:id',getHelperById);

router.delete('/delete/:id', deleteHelper);

router.put('/update/:id',uploadHelperFiles, updateHelper);

export default router;
