export function ButtonAccess(dataObject, moduleName, userType) {
  const defaultPermissions = {
    view: null,
    edit: null,
    delete: null,
  };
  if (
    userType === "SuperAdmin" ||
    userType === "Deputy Manager" ||
    userType === "Manager"
  ) {
    return {
      view: "1",
      edit: "1",
      delete: "1",
    };
  }
  if (userType === "FieldAgent") {
    return defaultPermissions;
  }
  const moduleObject = dataObject?.[moduleName];
  return moduleObject || defaultPermissions;
}
