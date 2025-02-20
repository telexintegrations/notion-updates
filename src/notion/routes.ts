import { Router } from "express";
import { handleTelexWebhook } from "../telex/services/webhooks";

const router = Router();

router.post("/", handleTelexWebhook);

export default router;
