export const getPlacementInfo = () => {
    try {
        const placementInfo = BX24.placement.info();
        return placementInfo;
    }
    catch (error) {
        console.error('Error fetching placement info:', error);
    }
}