import qrcode from 'qrcode';

const generateQrCode = async(employeeId: number,fullName: string,typeOfService: string) =>{
    try{
        const qrCodeData = {
            employeeId: employeeId,
            fullName: fullName,
            typeOfService: typeOfService
        };
        const qrCodeString = JSON.stringify(qrCodeData);
        const qrCodeUrl = await qrcode.toDataURL(qrCodeString);
        return qrCodeUrl;
    }catch(error){
        throw new Error('Failed to generate QR code');
    }

}
export default generateQrCode;