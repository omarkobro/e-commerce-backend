import { systemRoles } from "../../utils/systemRoles.js";

export let productPrievilges = {
    ADD_PRODUCT :[ systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
    UPDATE_PRODUCT :[ systemRoles.ADMIN, systemRoles.SUPER_ADMIN,]
}