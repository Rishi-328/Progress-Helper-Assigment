import Counter from '../models/counter.model';
export const getNextId = async() =>{
    try{
        const result = await Counter.findOneAndUpdate({ sequence: { $exists: true } },
            { $inc: { sequence: 1 } },
            { new: true, upsert: true }
        );
        return result.sequence;
    }catch(error){
        console.error('Error in fetching ID', error);
        throw error;
    }
}