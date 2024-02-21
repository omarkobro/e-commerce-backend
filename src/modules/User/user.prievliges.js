import { systemRoles } from "../../utils/systemRoles.js";

export let userPrivileges = {
    UPDATE_ACC :[ systemRoles.USER, systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    UPDATE_PASSWORD :[ systemRoles.USER, systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    DELETE_ACC :[ systemRoles.USER, systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    GET_ACC_INFO :[ systemRoles.USER, systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    GET_ACCOUNTS_BY_RECOVERY_EMAIL:[ systemRoles.USER, systemRoles.SUPER_ADMIN, systemRoles.ADMIN]
}