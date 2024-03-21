import { systemRoles } from "../../utils/systemRoles.js";

export let orderPrivileges = {
    CREATE_ORDER :[ systemRoles.USER, systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    REFUND_ORDER :[ , systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    CANCEL_ORDER :[ systemRoles.SUPER_ADMIN, systemRoles.ADMIN, systemRoles.USER],
    DELIVER_ORDER :[ systemRoles.DELIVERY]
} 