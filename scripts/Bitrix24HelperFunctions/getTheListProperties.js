import { callBX24Method } from "./callBX24Method.js";


export const getListProperties = async(propertyID) => {

    try{
        const result = await callBX24Method('catalog.productPropertyEnum.list', {filter: {propertyId: propertyID}});

        console.log(`List Properties for property ID: ${propertyID}`, result);
        return result;
    }
    catch(error){
        console.error('Error fetching list properties:', error);
        throw error;
    }

 
}