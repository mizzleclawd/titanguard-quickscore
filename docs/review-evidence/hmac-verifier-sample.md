# HMAC verifier sample

## Request signing
Outgoing handoff requests include:
- `x-titanguard-event: lead_assessment`
- `x-titanguard-timestamp: <unix-ms>`
- `x-titanguard-nonce: <uuid>`
- `x-titanguard-signature: <hex hmac sha256>`

Signature input:
`<timestamp>.<nonce>.<raw-json-body>`

Secret:
- `TITANGUARD_LEAD_WEBHOOK_SECRET`

## Verifier example (Node.js)
```js
import crypto from "node:crypto";

function verify(headers, rawBody, secret) {
  const timestamp = headers["x-titanguard-timestamp"];
  const nonce = headers["x-titanguard-nonce"];
  const provided = headers["x-titanguard-signature"];
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${nonce}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided || "", "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
```

## Anti-replay expectation
Receiver should reject:
- stale timestamps outside allowed skew window
- reused nonces already seen within that window
