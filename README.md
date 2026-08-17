This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment variables

- `NEXT_PUBLIC_GA_ID` — GA4 Measurement ID (e.g. `G-XXXXXXXXXX`), wired up in `app/layout.tsx` via `@next/third-parties/google`'s `GoogleAnalytics` component. Set in `.env.local`; GA is skipped entirely if unset.
- `NEXT_PUBLIC_META_PIXEL_ID` / `META_PIXEL_ID` — Meta Pixel ID (e.g. `123456789012345`). Injected non-blockingly via Next.js `next/script` (`strategy="afterInteractive"`) in `app/layout.tsx`. Fires standard `PageView` on all pages; skipped entirely if unset.
- `META_CAPI_ACCESS_TOKEN` — Meta Conversions API System User access token (generated in Meta Events Manager > Settings > Conversions API). Used by the server action (`app/(pages)/contact/actions.ts`) to send server-side `Lead` events. If missing, CAPI calls safely no-op without affecting the form submission.
- `LEAD_VALUE_EUR` — Optional default conversion value in EUR (e.g. `50`). Passed to both browser Meta Pixel and server CAPI `Lead` events.
- `META_TEST_EVENT_CODE` — Optional test code from Meta Events Manager > Test Events tab (e.g. `TEST12345`). Used during development to route server-side CAPI events directly to the Events Manager test console.

## Meta Pixel & Conversions API (CAPI) Verification

### 1. Browser Event Verification (Meta Pixel Helper)
1. Set `NEXT_PUBLIC_META_PIXEL_ID` in `.env.local` and start the app (`npm run dev`).
2. Install the [Meta Pixel Helper](https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension.
3. Visit any page: open the extension and verify that the `PageView` event has fired successfully.
4. Navigate to `/contact` and submit the contact form:
   - Verify that the `Lead` event fires upon success.
   - Inspect the event payload to verify `eventID` and `value` (if `LEAD_VALUE_EUR` is configured).

### 2. Server CAPI & Deduplication Verification (Meta Events Manager)
1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2) and select your Pixel/Dataset.
2. Navigate to the **Test events** tab.
3. Copy the **Server Test Code** (e.g., `TEST12345`) and add it to `.env.local` as `META_TEST_EVENT_CODE=TEST12345`.
4. Ensure `META_PIXEL_ID` and `META_CAPI_ACCESS_TOKEN` are set in `.env.local`.
5. In the Test Events tab, also enter your website URL in the **Browser** test section to open the site in a test session.
6. Submit the contact form at `/contact`.
7. In the Events Manager Test Events log, check the incoming events:
   - You should see two `Lead` events arrive: one from **Browser** (Pixel) and one from **Server** (Conversions API).
   - Both events will share the exact same `Event ID`.
   - Meta will automatically deduplicate them (indicated as **Deduplicated** in the event details).
8. Once verified, remove `META_TEST_EVENT_CODE` before deploying to production.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
