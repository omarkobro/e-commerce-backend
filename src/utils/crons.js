import { scheduleJob } from "node-schedule";
// import moment from "moment";
import { DateTime} from 'luxon'
import Coupon from "../../DB/models/coupon.model.js";


export function cronToChangeExpiredCoupons(){
    scheduleJob('0 0 0 */1 * *', async () => {
        console.log('cronToChangeExpiredCoupons()  is running every 5 seconds');
        const coupons = await Coupon.find({couponStatus:'valid'})
        for (const coupon of coupons) {
            if(
                DateTime.fromISO(coupon.toDate) < DateTime.now()
            ){
                coupon.couponStatus = 'expired'   
            }
            await coupon.save()
        }
    })
}