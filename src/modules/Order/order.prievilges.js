import { systemRoles } from "../../utils/systemRoles.js";

export let orderPrivileges = {
    CREATE_ORDER :[ systemRoles.USER, systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    DELIVER_ORDER :[ systemRoles.DELIVERY]

} 