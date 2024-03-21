import { systemRoles } from "../../utils/systemRoles.js";

export let brandPrivileges = {
    ADD_BRAND :[ systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    UPDATE_BRAND :[ systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    DELETE_BRAND :[ systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
}