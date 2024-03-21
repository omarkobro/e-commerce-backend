import { systemRoles } from "../../utils/systemRoles.js";

export let reviewPrivileges = {
    ADD_REVIEW :[ systemRoles.USER, systemRoles.SUPER_ADMIN],
    DELETE_REVIEW :[ systemRoles.USER, systemRoles.SUPER_ADMIN]
}