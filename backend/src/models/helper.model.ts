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
        required: false
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
    },
    email: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true
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
        required: false
    },
    joinedOn: {
        type: String,
        default: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    qrCode:{
        type: String,
        required: true
    }
})
const Helper = mongoose.model('Helper',helperSchema);
export default Helper