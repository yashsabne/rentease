 
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const minPriceValue = document.getElementById("minPriceValue");
const maxPriceValue = document.getElementById("maxPriceValue");
const pincode = document.getElementById("pincode");
const rentOrSell = document.getElementById("RentOrSell");
const typeProperty = document.getElementById("typeProperty");
const typePropertyLiveType = document.getElementById("typePropertyLiveType");
const searchButton = document.getElementById("searchButton");

minPrice.addEventListener("input", () => {
    minPriceValue.textContent = minPrice.value;
});

maxPrice.addEventListener("input", () => {
    maxPriceValue.textContent = maxPrice.value;
});

searchButton.addEventListener("click", () => {
    const minPriceVal = minPrice.value;
    const maxPriceVal = maxPrice.value;
    const pincodeVal = pincode.value;
    const rentOrSellVal = rentOrSell.value;
    const propertyTypeVal = typeProperty.value
    const typePropertyLiveTypeVal = typePropertyLiveType.value
    

    let query = "/properties?";

    if (minPriceVal) query += `minPrice=${minPriceVal}&`;
    if (maxPriceVal) query += `maxPrice=${maxPriceVal}&`;
    if (pincodeVal) query += `pincode=${pincodeVal}&`;
    if (rentOrSellVal) query += `rentOrSell=${rentOrSellVal}&`;
    if(propertyTypeVal) query +=`propertyType=${propertyTypeVal}&`
    if(typePropertyLiveTypeVal) query += `propertyTypeLive=${typePropertyLiveTypeVal}&`



    // Remove the trailing '&' or '?' if it exists
    query = query.replace(/[&?]$/, "");

    window.location.href = query;
});

const specInfo = document.querySelectorAll('.specs-info');

specInfo.forEach((info) => {
if(info.innerHTML.includes("on sell")) {
info.innerHTML = "on sell (for Buyer)";
}
});

 