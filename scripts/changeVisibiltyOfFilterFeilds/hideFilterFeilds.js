export const hideFilterFields = (fieldsToHide) => {

    fieldsToHide.forEach(fieldId => {
        const fieldElement = document.getElementById(fieldId);
        if (fieldElement) {
            fieldElement.style.display = 'none';
        }
    });

}