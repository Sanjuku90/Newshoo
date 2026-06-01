import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import plansRouter from "./plans";
import investmentsRouter from "./investments";
import depositsRouter from "./deposits";
import withdrawalsRouter from "./withdrawals";
import referralsRouter from "./referrals";
import kycRouter from "./kyc";
import ticketsRouter from "./tickets";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import promoCodesRouter from "./promo-codes";
import cronAdminRouter from "./cron-admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(plansRouter);
router.use(investmentsRouter);
router.use(depositsRouter);
router.use(withdrawalsRouter);
router.use(referralsRouter);
router.use(kycRouter);
router.use(ticketsRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(promoCodesRouter);
router.use(cronAdminRouter);

export default router;
