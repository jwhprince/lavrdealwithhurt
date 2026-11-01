import { createLeadHandler } from "../../../lib/leads";
import { sendLead } from "../../../lib/mail";

export const runtime = "nodejs";
export const POST = createLeadHandler({ send: sendLead });
