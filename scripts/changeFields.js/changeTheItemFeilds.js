import { callBX24Method } from "../Bitrix24HelperFunctions/callBX24Method.js";

export const changeTheItemFields = async (productID) => {

    const priceField = document.getElementById("total-price");

    if(!productID){
        priceField.value = '';
        return;
    }



  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",

    currency: "USD",
  });

  console.log("Changing fields for product ID:", productID);

  const productData = await callBX24Method("catalog.product.get", {
    id: productID,
  });

  console.log("Fetched product data:", productData);

  const baseRate = productData.product.property115.value || 0;
  const grossarea = productData.product.property113.value || 0;

  const valuesToSet = {
    totalPrice: Number(
      (
        Number(baseRate.replace(/,/g, "")) * Number(grossarea.replace(/,/g, ""))
      ).toFixed(2),
    ),
    grossArea: grossarea,
    baseRate: baseRate,
  };

  console.log("Calculated values to set:", valuesToSet);

  priceField.innerHTML = "";

  const grossAreaField = document.getElementById("gross-area");
  const baseRateField = document.getElementById("base-rate");

  grossAreaField.value = valuesToSet.grossArea;
  baseRateField.value = valuesToSet.baseRate;
  priceField.value =  valuesToSet.totalPrice ? formatter.format(valuesToSet.totalPrice) : '';
};
