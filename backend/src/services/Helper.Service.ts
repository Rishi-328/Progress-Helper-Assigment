import HelperModel from '../models/helper.model';
import { deleteImage, uploadImage } from '../utils/cloudinary.utils';
import { getImageName } from '../utils/ExtractImageName';
import { getNextId } from '../utils/getNextId';
import generateQrCode from '../utils/qrcode';

export class HelperService{
    checkPhoneExists = async(phone: string)=>{
        const phoneNumberExist = await HelperModel.findOne({phone: phone});
        return phoneNumberExist;
    }
    checkEmailExists = async(email: string)=>{
        const emailExist = await HelperModel.findOne({email: email});
        return emailExist;
    }
    getCount = async() => {
        const length = await HelperModel.countDocuments({});
        return length;
    }
    getHelperById = async(id: string) =>{
        const helper = await HelperModel.findById(id);
        return helper;
    }
    getHelpers = async({searchTerm,service,org,startDate,endDate,sortBy}: {
        searchTerm?: string;
        service?: string[];
        org?: string[];
        startDate?: Date;
        endDate?: Date;
        sortBy?: string;
    }) =>{
        let filter: any = {};
        if(searchTerm){
            const safeSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(safeSearch,'i');
            filter.$or = [
                {fullName: regex},
                {employeeId: isNaN(+safeSearch) ? -1 : +safeSearch},
                {phone: regex}
                ]
        }
        if(service?.length){
            filter.typeOfService = { $in: service };
        }
        if(org?.length){
            filter.organizationName = { $in: org }; 
        } 
        if(startDate && endDate){
            const start = new Date(startDate);
            start.setHours(0,0,0,0);
            const end = new Date(endDate);
            end.setHours(23,59,59,999);
            filter.joinedOn = {$gte: start, $lte: end};
        }
        const pipe : any[]= [{$match: filter}]
        if(sortBy){
            pipe.push({$sort: {[sortBy]: 1}});
        }
        const helpers = await HelperModel.aggregate(pipe);
        return helpers;
    }
    createHelper = async(data: any,files?: {[field: string]: Express.Multer.File[]} ) => {
        let cleanUpUrls: string[] = [];
        try{
            const id = await getNextId();
            data.employeeId = id;
            const fileNames = ['photo','kycDocument','additionalDocuments'];
            for(const field of fileNames){
                const file = files?.[field]?.[0];
                if(file){
                    const public_id = `${field}-${Date.now()}`;
                    const result = await uploadImage(file,public_id);
                    data[field] = {
                    url : result.secure_url,
                    name: file.originalname,
                    size: file.size
                    };
                    cleanUpUrls.push(public_id);
                }
            }
            const newHelper = new HelperModel(data);
            const qrCodeUrl = await generateQrCode(newHelper.employeeId,newHelper.fullName,newHelper.typeOfService);
            newHelper.qrCode = qrCodeUrl;
            const helper = await HelperModel.insertOne(newHelper);
            return helper;
        }catch(error){
            for(const public_id of cleanUpUrls){
                deleteImage(public_id);
            }
            throw error;
        }

    }
    updateHelper = async(id:string,updateData: any,files?: {[field: string]: Express.Multer.File[]})=>{
        const fileNames = ['photo', 'kycDocument', 'additionalDocuments'];
        for(const field of fileNames){
        const file = files?.[field]?.[0];
        if(file){
            const data = await HelperModel.findById<{[key:string]:any}>(id,{_id : 0, [field]: 1});
            if (data?.[field]) {
            deleteImage(getImageName(data[field].url ?? '')); 
            }
            const public_id = `${field}-${Date.now()}`;
            const result = await uploadImage(file,public_id);
            updateData[field] = {
            url : result.secure_url,
            name: file.originalname,
            size: file.size
            };
        }

        }
        const helper = await HelperModel.findByIdAndUpdate(id,updateData,{ new: true });    
        return helper;    
    }
    deleteHelper = async(id: string) =>{
        const helper = await HelperModel.findByIdAndDelete({ _id: id});
        if(helper?.photo){
            const photoName = getImageName(helper.photo.url ?? '');
            deleteImage(photoName);
        }
        if(helper?.kycDocument){
            const kycName = getImageName(helper.kycDocument.url ?? '');
            deleteImage(kycName);
        } 
        if(helper?.additionalDocuments){
            const additionalName = getImageName(helper.additionalDocuments.url ?? '');
            deleteImage(additionalName);
        }  
        return helper;
    }
}



