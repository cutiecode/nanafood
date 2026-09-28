import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// This app has no nonce infrastructure and relies heavily on inline
// `style={{...}}` props everywhere (the `style` HTML attribute can only ever
// be allowed via 'unsafe-inline'/hashes — CSP nonces don't cover it), so we
// use the plain next.config headers() approach rather than a nonce-based CSP
// in proxy.ts. That approach also forces every page into dynamic rendering,
// which this app doesn't otherwise need.
//
// External origins actually used by the app today, verified in the code:
// - Stripe Checkout is reached via a full top-level redirect
//   (`window.location.href = session.url` in CartSidebar.tsx) to Stripe's
//   own hosted page — that navigation is NOT governed by CSP at all, so
//   nothing below is required for it to keep working. js.stripe.com /
//   api.stripe.com are still allowlisted defensively, since
//   @stripe/stripe-js and @stripe/react-stripe-js are installed
//   dependencies that aren't wired up yet but could be later.
// - Fonts (Playfair Display, DM Sans) are loaded through next/font/google,
//   which self-hosts the font files at build time — no request ever goes to
//   fonts.googleapis.com/fonts.gstatic.com at runtime, so font-src 'self' is
//   sufficient.
// - No other external script, style, image or XHR/fetch target exists
//   anywhere in the codebase (verified via grep for <script>, fetch(https,
//   cdn/unpkg/jsdelivr, googleapis/gstatic).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Content-Security-Policy", value: cspHeader.replace(/\s{2,}/g, " ").trim() },
        ],
      },
    ];
  },
};

export default nextConfig;
