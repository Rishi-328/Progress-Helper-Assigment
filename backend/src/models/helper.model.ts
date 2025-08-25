import mongoose ,{Schema} from "mongoose";

const helperSchema = new Schema({
    employeeId:{
        type: Number,
        required: true,
        unique: true
    },
    photo: {
        type: {
            url: String,
            name: String,
            size: Number
        },
    },
    typeOfService:{
        type: String,
        required: true
    },
    organizationName: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    languages: {
        type: [String],
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,   
        unique: true
    },
    email: {
        type: String
    },
    vehicleType: {
        type: String,
        required: true
    },
    vehicleNumber:{
        type: String,
    },
    kycDocument: {
        type: {
            url: String,
            name: String,
            size: Number
        },
        required: true
    },
    kycDocumentType: {
        type: String,
        required: true
    },
    additionalDocuments: {
        type: {
            url: String,
            name: String,
            size: Number
        },
    },
    joinedOn: {
        type: Date,
        default: Date.now
    },
    qrCode:{
        type: String,
        required: true
    }
})
const Helper = mongoose.model('Helper',helperSchema);
export default Helper