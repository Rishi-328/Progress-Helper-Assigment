import  { Request, Response } from 'express'; 
import { HelperService}  from '../services/Helper.Service';

const helperService = new HelperService();

export const createHelper = async (req: Request, res: Response) => {
  try {
    const {typeOfService,organizationName,fullName,languages,gender,phone,email,vehicleType,vehicleNumber,kycDocumentType} = req.body;
    const files = req.files as {
      [fiedname: string]: Express.Multer.File[];
    }
    if(!typeOfService || !organizationName || !fullName || !languages || !gender || !phone || !vehicleType || !kycDocumentType){
      return res.status(400).json({message: "All fields are required"});
    }
    if(vehicleType !== 'None' && !vehicleNumber){
      return res.status(400).json({message: "Vehicle number is required when vehicle type is specified"});
    }
    if(files && !files.kycDocument){
      return res.status(400).json({message: "KYC document are required"});
    }
    const response = await helperService.createHelper({
      typeOfService,
      organizationName,
      fullName,
      languages, 
      gender,
      phone,
      email,
      vehicleType,
      vehicleNumber,
      kycDocumentType
    },files);
    res.status(201).json(response);
  }catch (error) {
    res.status(500).json({message: 'Failed to create helper',error});
  }
};

export const getHelpers = async (req: Request, res: Response) => {
    try{
      const {sortBy,searchTerm,service,org,startDate,endDate} = req.body;
      const helpers = await helperService.getHelpers({searchTerm,service,org,startDate,endDate,sortBy});
      res.status(200).json(helpers);
    }catch(error){
        res.status(500).json({message: 'Failed to get helpers', error});
    }
}

export const getCount = async (req: Request, res: Response)=>{
  try{
    const length = await helperService.getCount();
    res.status(200).json({count: length});
  }catch(error){
    res.status(500).json({message:'Failed to get count',error});
  }
  
}

export const getHelperById = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    if(!id){
      return res.status(400).json({message: 'ID is required'});
    }
    const helper = await helperService.getHelperById(id);
    if (helper) {
      res.status(200).json(helper);
    }else{
      res.status(404).json({ message: 'Helper not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to get helper', error });
  }
};

export const deleteHelper = async (req: Request, res: Response)=>{
  try{
    const {id} = req.params;
    if(!id){
      return res.status(400).json({message: 'ID is required'});
    }
    const helper = await helperService.deleteHelper(id);
    if(helper){   
      res.status(200).json({message: `Deleted ${helper.fullName}`});   
    }else{
      res.status(404).json({message: 'Helper not found'});
    }
  }catch(error){
    res.status(500).json({message: 'Failed to delete helper', error});
  }
}

export const updateHelper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if(!id){
      return res.status(400).json({message: 'ID is required'});
    }
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    }
    const {typeOfService,organizationName,fullName,languages,gender,phone,email,vehicleType,vehicleNumber} = req.body;
    const helper = await helperService.updateHelper(id,{
      typeOfService,
      organizationName,
      fullName,
      languages,
      gender,
      phone,
      email,
      vehicleType,
      vehicleNumber
    }, files);
    if(helper) {
      res.status(200).json({ message: 'Changes Saved!'});
    } else {
      res.status(404).json({ message: 'Helper not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update helper', error });
  }
}