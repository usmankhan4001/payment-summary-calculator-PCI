export const unhideFilterFields = (fieldsToUnhide) => {

    fieldsToUnhide.forEach(fieldId => {
        const fieldElement = document.getElementById(fieldId);
        if (fieldElement) {
            fieldElement.style.display = 'block';
        }
    });

}