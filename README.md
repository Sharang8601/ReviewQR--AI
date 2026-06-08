# Boost The Reviews

MVP SaaS for businesses to collect customer feedback, generate polished Google reviews with AI, and send customers to the Google review page.

## Apps

- `apps/web`: Next.js + Tailwind frontend for business owners and customers.
- `apps/api`: Express + MongoDB backend with auth, business profiles, QR generation, AI reviews, analytics, and Razorpay order creation.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Start MongoDB and add your free Gemini API key to `apps/api/.env` (get one at https://aistudio.google.com/apikey).

4. Run both apps:

```bash
npm run dev:api
npm run dev:web
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:5000`

## MVP Flow

1. Business signs up or logs in.
2. Business creates a profile and enters the Google review link.
3. Backend generates a QR code pointing to `/review/:businessId`.
4. Customer scans QR, rates, types or dictates feedback.
5. Google Gemini generates a professional review.
6. Customer copies the review and opens the Google review page.

## Deployment

- Deploy `apps/web` to Vercel.
- Deploy `apps/api` to Render.
- Use MongoDB Atlas for `MONGODB_URI`.

