import HelperModel from '../models/helper.model';
import { deleteImage, uploadImage } from '../utils/cloudinary.utils';
import { getImageName } from '../utils/ExtractImageName';
import { getNextId } from '../utils/getNextId';
import generateQrCode from '../utils/qrcode';
import ExcelJS from 'exceljs';

export class HelperService{
    checkFieldExists = async(field: string)=>{
        const phoneNumberExist = await HelperModel.findOne({field: field});
        return phoneNumberExist;
    }
    getCount = async() => {
        const length = await HelperModel.countDocuments({});
        return length;
    }
    getHelperById = async(id: string) =>{
        const helper = await HelperModel.findById(id);
        return helper;
    }
    getHelpers = async({searchTerm,service,org,startDate,endDate,sortBy,page}: {
        searchTerm?: string;
        service?: string[];
        org?: string[];
        startDate?: Date;
        endDate?: Date;
        sortBy?: string;
        page?: number;
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
        const skip = page ? page * 10 : 0;
        pipe.push({$skip: skip},{$limit: 10});
        const helpers = await HelperModel.aggregate(pipe);
        const totalCount = helpers.length;
        return { helpers, totalCount };
    }
    createHelper = async(data: any,files?: {[field: string]: Express.Multer.File[]} ) => {
        let cleanUpUrls: string[] = [];
        try{
            const phoneNumberExist = await this.checkFieldExists(data.phone);
            if(phoneNumberExist){
                return {message: 'Helper with this phone number already exists'};
            }
            if(data.email){
                const emailExist = await this.checkFieldExists(data.email);
                if(emailExist){
                    return {message: 'Helper with this email already exists'};
                }
            }
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
    downloadHelpers = async(helpers: any[])=>{
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Helpers');
        worksheet.columns = [
            { header: 'Employee ID', key: 'employeeId', width: 15 },
            { header: 'Full Name', key: 'fullName', width: 30 },
            { header: 'Photo', key:'photo', width: 30},
            { header: 'Type of Service', key: 'typeOfService', width: 20 },
            { header: 'Organization Name', key: 'organizationName', width: 25 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'KYC Document', key: 'kycDocument', width: 30 },
            { header: 'KYC Document Type', key: 'kycDocumentType', width: 20 },
            { header: 'Vehicle Type', key: 'vehicleType', width: 20 },
            { header: 'Vehicle Number', key: 'vehicleNumber', width: 20 },
            { header: 'Joined On', key: 'joinedOn', width: 20 },
            { header: 'Additional Documents', key: 'additionalDocuments', width: 30 },
        ]
        helpers.forEach(helper =>{
            const row = worksheet.addRow({
                employeeId: helper.employeeId,
                fullName: helper.fullName,
                photo: helper.photo?.url,
                typeOfService: helper.typeOfService,
                organizationName: helper.organizationName,  
                phone: helper.phone,
                email: helper.email,
                kycDocument: helper.kycDocument?.url,
                kycDocumentType: helper.kycDocumentType,
                vehicleType: helper.vehicleType,    
                vehicleNumber: helper.vehicleNumber,
                joinedOn: helper.joinedOn,
                additionalDocuments: helper.additionalDocuments?.url
            });
            if(helper.photo?.url){
                row.getCell('photo').value = {
                    text: helper.photo.url,
                    hyperlink: helper.photo.url
                }
            }
            if(helper.kycDocument?.url){
                row.getCell('kycDocument').value = {
                    text: helper.kycDocument.url,
                    hyperlink: helper.kycDocument.url
                }
            }
            if(helper.additionalDocuments?.url){
                row.getCell('additionalDocuments').value = {
                    text: helper.additionalDocuments.url,
                    hyperlink: helper.additionalDocuments.url
                }
            }
            
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
      
          
       
    }
}



