# GRIT Awards - Deployment Guide

## 🚀 Production Deployment on Vercel

This guide covers deploying the GRIT Awards homepage to Vercel with optimized performance, security, and monitoring.

---

## Prerequisites

- [ ] GitHub repository connected to Vercel
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Environment variables ready (see below)
- [ ] All changes committed to `main` branch

---

## Environment Variables

Configure these in your Vercel project settings (`Settings` → `Environment Variables`):

### Required Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: UKMS API Keys (if needed)
VITE_UKMS_API_KEY=your-ukms-api-key
VITE_UKMS_API_ENDPOINT=https://api.ukms.org.uk
```

### Analytics & Monitoring (Optional)

```bash
# Google Analytics 4
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry Error Tracking
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

> ⚠️ **Security Note**: Never commit `.env` files to version control. All sensitive keys must be stored in Vercel's environment variables.

---

## Build Configuration

### Vite Build Settings

The project is configured for optimal production builds:

- **Source maps**: Disabled in production
- **Console logs**: Removed automatically
- **Bundle splitting**: Vendor chunks optimized
- **Minification**: Terser with aggressive compression
- **Target**: ES2015 for modern browsers

### Build Commands

```bash
# Local production build
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size (optional)
npm run build -- --mode analyze
```

Expected build output:
- **Bundle size**: < 250 KB gzipped
- **Build time**: < 30 seconds
- **Output directory**: `dist/`

---

## Vercel Configuration

### Automatic Deployments

1. **Push to GitHub**: 
   ```bash
   git add .
   git commit -m "Deploy: Production ready"
   git push origin main
   ```

2. **Vercel builds automatically**:
   - Preview deployments for all branches
   - Production deployment for `main` branch

3. **Monitor build**: Visit your Vercel dashboard

### Manual Deployment (if needed)

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Performance Optimization

### Caching Strategy

Configured in `vercel.json`:

| Asset Type | Cache Duration | Strategy |
|------------|----------------|----------|
| Static assets (`/assets/*`) | 1 year | Immutable |
| Images (`.webp`, `.png`, etc.) | 1 year | Immutable |
| HTML files | 0 | Must revalidate |

### Image Optimization

- All images use `.webp` format
- Hero image preloaded in `<head>`
- Lazy loading on non-critical images
- `decoding="async"` for better performance

### Font Loading

- Google Fonts loaded asynchronously
- Fonts preloaded for critical text
- Fallback fonts defined in CSS

---

## Security Configuration

### HTTP Headers

Applied via `vercel.json`:

```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

### Content Security Policy (CSP)

To add stricter CSP, create `public/_headers`:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;
```

### HTTPS

- Automatic HTTPS via Vercel
- HTTP → HTTPS redirect enabled by default
- TLS 1.3 support

---

## Analytics & Monitoring

### Vercel Analytics

1. Enable in Vercel Dashboard:
   - Go to `Analytics` tab
   - Click "Enable Analytics"
   - Select "Audience" and "Web Vitals"

2. Verify Core Web Vitals tracking:
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

### Google Analytics 4 (Optional)

Add to `index.html` if using GA4:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Error Tracking with Sentry (Optional)

1. Install Sentry:
   ```bash
   npm install @sentry/react @sentry/vite-plugin
   ```

2. Configure in `src/main.jsx`:
   ```javascript
   import * as Sentry from "@sentry/react";
   
   if (import.meta.env.PROD) {
     Sentry.init({
       dsn: import.meta.env.VITE_SENTRY_DSN,
       integrations: [new Sentry.BrowserTracing()],
       tracesSampleRate: 1.0,
     });
   }
   ```

---

## Post-Deployment Verification

### 1. Lighthouse Audit

Run from terminal:

```bash
npx lighthouse https://grit-awards.vercel.app/ --view
```

**Expected Scores** (≥ 90):
- ✅ Performance: 90+
- ✅ Accessibility: 95+
- ✅ Best Practices: 95+
- ✅ SEO: 100

### 2. Manual Testing Checklist

- [ ] Homepage loads in < 2 seconds
- [ ] All images render correctly
- [ ] Login modal opens and functions
- [ ] "Get Started" CTA scrolls to footer
- [ ] Cookie consent appears on first visit
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Keyboard navigation works (Tab / Shift+Tab)
- [ ] All links and buttons are accessible
- [ ] No console errors or warnings

### 3. SEO Verification

Check metadata rendering:

```bash
curl -s https://grit-awards.vercel.app/ | grep -i "og:"
```

Expected output:
```html
<meta property="og:title" content="GRIT Awards – Building Life-Ready Children" />
<meta property="og:description" content="A UKMS initiative empowering children..." />
<meta property="og:image" content="/grit-hero.webp" />
```

### 4. Security Headers

Verify headers:

```bash
curl -I https://grit-awards.vercel.app/
```

Look for:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 5. Performance Metrics

Monitor in Vercel Analytics:
- **Time to First Byte (TTFB)**: < 600ms
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Total Blocking Time (TBT)**: < 200ms

---

## Rollback Procedure

If issues occur post-deployment:

1. **Instant Rollback** in Vercel Dashboard:
   - Go to `Deployments`
   - Find previous working deployment
   - Click `⋯` → `Promote to Production`

2. **Git Revert** (if needed):
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Verify all dependencies in `package.json`
3. Test build locally: `npm run build`
4. Check Node.js version (use Node 18+)

### Environment Variables Not Working

1. Ensure variables are prefixed with `VITE_`
2. Redeploy after adding variables
3. Check variable scope (Production/Preview/Development)

### Images Not Loading

1. Verify images exist in `/public` directory
2. Check image paths (should be relative to root: `/image.webp`)
3. Confirm `.webp` format is supported

### Slow Performance

1. Check bundle size: `npm run build -- --mode analyze`
2. Verify image sizes (max 2000px width)
3. Check Vercel Analytics for bottlenecks
4. Ensure caching headers are applied

---

## Continuous Monitoring

### Daily Checks
- [ ] Vercel Analytics dashboard
- [ ] Error logs in Vercel
- [ ] Uptime monitoring (use UptimeRobot or similar)

### Weekly Reviews
- [ ] Lighthouse scores
- [ ] Core Web Vitals trends
- [ ] User analytics and engagement
- [ ] Security audit (npm audit)

### Monthly Tasks
- [ ] Dependency updates (`npm outdated`)
- [ ] Security patches
- [ ] Performance optimization review
- [ ] Content freshness check

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **GRIT Awards Support**: support@gritawards.co.uk

---

## Deployment Checklist

Before promoting to production:

- [ ] All environment variables configured
- [ ] Build completes successfully
- [ ] Lighthouse scores ≥ 90
- [ ] No console errors
- [ ] All modals and CTAs work
- [ ] Images load correctly
- [ ] Analytics tracking confirmed
- [ ] Security headers verified
- [ ] SEO metadata present
- [ ] Mobile responsiveness tested
- [ ] Accessibility tested
- [ ] Cookie consent functional
- [ ] Performance metrics acceptable

---

**Last Updated**: 2025-10-20  
**Version**: 1.0.0  
**Maintained by**: GRIT Awards Development Team

