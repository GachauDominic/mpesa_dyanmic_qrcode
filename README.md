# M-Pesa Dynamic QR service

Express + TypeScript + Drizzle ORM + PostgreSQL starter for generating M-Pesa
Dynamic QR codes via Safaricom's Daraja API, with a merchant/channel model
that supports both:

- **Fixed-channel QR**: caller sends just an amount, the merchant's default
  channel (Till, Paybill, Pochi la Biashara, or Send Money) is used.
- **Chosen-channel QR**: caller specifies `channelType` to generate a QR for
  a specific one of the merchant's configured channels.

## 1. Get Daraja credentials (do this first — you can't call the real API without it)

1. Go to https://developer.safaricom.co.ke and create an account.
2. Log in, click "Create App", give it a name, and select the APIs you need:
   **Dynamic QR** and **Customer To Business (C2B)**.
3. Once created, open the app to get your **sandbox Consumer Key and
   Consumer Secret** — copy these into `.env`.
4. On the sandbox, you're given test shortcodes (a Paybill/Till number) to
   use as your `CPI` while testing — you don't need a real business number yet.
5. Sandbox base URL is `https://sandbox.safaricom.co.ke` (already set as the
   default in `.env.example`).
6. Going live later requires Safaricom's "Go Live" review with your real
   Till/Paybill number, so don't worry about production credentials yet.

## 2. Local setup

```bash
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET

npm install
npm run db:generate   # creates SQL migration files from src/db/schema.ts
npm run db:migrate    # applies them to your database
npm run db:seed       # creates one merchant + one channel + one admin user
npm run dev           # starts the API on http://localhost:3000
```

## 3. Try it

```bash
# Log in as the seeded admin to get a JWT
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme123"}'

# Generate a QR using the merchant's default channel
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Authorization: Bearer <token from login>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

The response includes `qrCodeDataUri` — drop that straight into an `<img src="...">`.

## 4. Registering C2B callback URLs

Before you can know a QR has actually been paid, you must register your
`/api/mpesa/c2b/validation` and `/api/mpesa/c2b/confirmation` URLs with
Daraja (a one-time call per shortcode, made from your own backend once —
this isn't in this starter yet, add a small script that calls
`POST /mpesa/c2b/v1/registerurl` with those two URLs). In sandbox, use a
tunnel like ngrok so Safaricom can reach your local machine.

## What's deliberately left out of this starter

- Rate limiting / request logging middleware
- Retry logic for failed Daraja calls
- Multi-tenant onboarding endpoints (add merchants/channels via the API
  instead of only the seed script) — straightforward to add on top of the
  existing schema when you're ready to open this up to other businesses
- Expiring/regenerating a QR after N minutes of no payment
