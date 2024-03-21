import { systemRoles } from "../../utils/systemRoles.js";

export let authPrievilges = {
    FORGET_PASSWORD:[ systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.DELIVERY],
    UPDATE_PASSWORD:[ systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.DELIVERY],
}