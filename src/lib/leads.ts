export type Lead = { name: string; phone: string; direction: string; consent: true };
export type LeadEnvironment = Record<string, string | undefined>;
type Sender = (lead: Lead, env: LeadEnvironment) => Promise<boolean>;

const MAX_BYTES = 4096;
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 5;

// Single Node.js instance only. Multi-instance hosting needs a shared rate limiter.
export function createRateLimiter(now: () => number = Date.now) {
  const buckets = new Map<string, { count: number; expires: number }>();
  return (key: string): number => {
    const time = now();
    for (const [ip, bucket] of buckets) if (bucket.expires <= time) buckets.delete(ip);
    let bucket = buckets.get(key);
    if (!bucket) {
      // Refuse new keys at capacity rather than evicting active limits.
      if (buckets.size >= 10000) return 60;
      bucket = { count: 0, expires: time + WINDOW_MS };
      buckets.set(key, bucket);
    }
    bucket.count++;
    return bucket.count > LIMIT ? Math.ceil((bucket.expires - time) / 1000) : 0;
  };
}

function response(status: number, message: string, extra: Record<string, string> = {}) {
  return Response.json({ ok: status === 200, message }, { status, headers: { "Cache-Control": "no-store", ...extra } });
}

export function createLeadHandler({ send, env = process.env, limit = createRateLimiter() }: {
  send: Sender; env?: LeadEnvironment; limit?: (key: string) => number;
}) {
  return async (request: Request): Promise<Response> => {
    if (env.LEADS_ENABLED !== "true" || env.LEGAL_APPROVED !== "true" || [env.LEGAL_OPERATOR, env.LEGAL_INN, env.LEGAL_ADDRESS, env.PRIVACY_EMAIL, env.LEGAL_RETENTION].some(value => !value?.trim())) {
      return response(503, "Онлайн-запись пока недоступна. Попробуйте связаться со школой через контакты на сайте.");
    }
    let origin: string;
    try { origin = new URL(env.SITE_URL || "").origin; } catch { return response(503, "Онлайн-запись временно недоступна."); }
    if (request.headers.get("origin") !== origin) return response(403, "Отправьте заявку через форму на сайте.");
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return response(415, "Неподдерживаемый формат заявки.");
    // Never trust client-supplied forwarding headers unless the deployment explicitly enables it.
    const key = env.TRUST_PROXY === "true" ? request.headers.get("x-forwarded-for")?.split(",")[0].trim().slice(0, 64) || "unknown" : "shared";
    const retry = limit(key);
    if (retry) return response(429, "Слишком много попыток. Пожалуйста, попробуйте позже.", { "Retry-After": String(retry) });
    if (Number(request.headers.get("content-length")) > MAX_BYTES) return response(413, "Заявка слишком большая.");
    let body: unknown;
    try {
      const reader = request.body?.getReader();
      if (!reader) return response(400, "Заполните форму заявки.");
      let bytes = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BYTES) { await reader.cancel(); return response(413, "Заявка слишком большая."); }
        chunks.push(value);
      }
      const merged = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
      body = JSON.parse(new TextDecoder().decode(merged));
    } catch { return response(400, "Не удалось прочитать заявку. Проверьте данные."); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return response(400, "Проверьте данные заявки.");
    const data = body as Record<string, unknown>;
    if (data.website !== undefined && data.website !== "") return response(400, "Не удалось отправить заявку.");
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";
    const direction = data.direction === undefined ? "" : data.direction;
    if (name.length < 2 || name.length > 80 || /[\r\n\x00-\x1f\x7f]/.test(name) || phone.length > 24 || !/^[+\d ()-]+$/.test(phone) || !/^\d{10,15}$/.test(phone.replace(/\D/g, "")) || data.consent !== true || typeof direction !== "string" || !["", "sport", "baby", "latina"].includes(direction)) {
      return response(400, "Укажите имя, корректный телефон и согласие на обработку персональных данных.");
    }
    try {
      if (!await send({ name, phone, direction, consent: true }, env)) return response(503, "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь со школой через контакты на сайте.");
    } catch { return response(503, "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь со школой через контакты на сайте."); }
    return response(200, "Спасибо! Заявка отправлена. Мы свяжемся с вами, чтобы выбрать время занятия.");
  };
}
