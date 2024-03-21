import { systemRoles } from "../../utils/systemRoles.js";

export let subCategoryPrivileges = {
    ADD_SUBCATEGORY :[ systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    DELETE_SUBCATEGORY :[ systemRoles.ADMIN, systemRoles.SUPER_ADMIN]
}