import { callBX24Method } from "./callBX24Method.js";


export const getLeadData = async (leadId) => {

    try{

        const leadData = await callBX24Method('crm.lead.get', {id: leadId});

        console.log('Lead Data:', leadData);

        return leadData;

    }
    catch (error){
        console.error('Error fetching lead data:', error);
    }


}