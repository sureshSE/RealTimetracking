export function userPermissionPage(dataObject, moduleName, userType) {

    if (userType === "SuperAdmin") {
        return true; // SuperAdmin have access to everything
    } else {
        if (dataObject && dataObject[moduleName] === "1") {
            return true;
        } else {
            return false;
        }
    }

}
