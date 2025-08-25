import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({ storage });

const uploadHelperFiles = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'kycDocument', maxCount: 1 },
  { name: 'additionalDocuments', maxCount: 1 }
]);
export default uploadHelperFiles;

