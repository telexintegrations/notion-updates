import { Router } from "express";
import { integrationJSON } from "./config/integrationJSON";
import { handleTelexWebhook } from "./services/webhooks";
const router = Router();


router.get("/", integrationJSON);

export default router;
