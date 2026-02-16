import { callBX24Method } from "./callBX24Method.js";

export const getTheProductData = async (productId) => {
    try {
        const productData = await callBX24Method('crm.product.get', { id: productId });
        return productData;
    }
    catch (error) {
        console.error("Error fetching product data:", error);
        return null;
    }
}