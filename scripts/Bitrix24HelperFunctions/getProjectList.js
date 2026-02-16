import { callBX24Method } from "./callBX24Method.js"

export const getProjectList = async () => {

    try {
        const projects = await callBX24Method('catalog.productPropertyEnum.list', {filter: {propertyId: 173}});

        console.log('Projects:', projects);

        return projects;
    }
    catch (error){
        console.error('Error fetching projects:', error);
    }



}