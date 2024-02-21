import { systemRoles } from "../../utils/systemRoles.js";

export let brandPrivileges = {
    UPDATE_BRAND :[ systemRoles.USER, systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    DELETE_BRAND :[ systemRoles.USER, systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
}