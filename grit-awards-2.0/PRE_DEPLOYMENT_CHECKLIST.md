# GRIT Awards - Pre-Deployment Checklist

Use this checklist before promoting any deployment to production.

---

## 📋 Build & Configuration

### Build Process
- [ ] `npm run build` completes without errors
- [ ] Build time is under 30 seconds
- [ ] Output directory `dist/` contains all required files
- [ ] No TypeScript or ESLint errors
- [ ] Source maps are disabled (`build.sourcemap: false` in vite.config.js)
- [ ] Console logs are removed in production build

### Bundle Size
- [ ] Total bundle size < 250 KB gzipped
- [ ] Main chunk < 150 KB
- [ ] Vendor chunks properly split
- [ ] No duplicate dependencies
- [ ] Tree shaking working correctly

### Dependencies
- [ ] All dependencies up to date (run `npm outdated`)
- [ ] No critical vulnerabilities (run `npm audit`)
- [ ] Development dependencies not included in production bundle
- [ ] Peer dependencies resolved

---

## 🔒 Security

### Environment Variables
- [ ] All sensitive keys stored in Vercel environment variables
- [ ] `.env` files not committed to repository
- [ ] `VITE_SUPABASE_URL` configured
- [ ] `VITE_SUPABASE_ANON_KEY` configured
- [ ] API keys rotated if compromised
- [ ] Environment variables scoped correctly (Production/Preview/Development)

### Security Headers
- [ ] `X-Content-Type-Options: nosniff` applied
- [ ] `X-Frame-Options: SAMEORIGIN` applied
- [ ] `X-XSS-Protection: 1; mode=block` applied
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` applied
- [ ] Content Security Policy configured
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] No sensitive data in client-side code
- [ ] No hardcoded credentials

### API Security
- [ ] Supabase Row Level Security (RLS) enabled
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Authentication working correctly
- [ ] Authorization checks in place

---

## ⚡ Performance

### Images
- [ ] All images optimized as `.webp`
- [ ] Hero image preloaded in `<head>`
- [ ] Non-critical images use `loading="lazy"`
- [ ] All images have `decoding="async"`
- [ ] Image dimensions specified to prevent layout shift
- [ ] Maximum image width: 2000px
- [ ] Images compressed (< 200 KB each)

### Fonts
- [ ] Google Fonts loaded asynchronously
- [ ] Fonts preloaded for critical text
- [ ] Font display strategy: swap
- [ ] Fallback fonts defined
- [ ] No FOIT (Flash of Invisible Text)

### Caching
- [ ] Static assets cache: 1 year (`max-age=31536000`)
- [ ] HTML cache: immediate revalidation (`max-age=0, must-revalidate`)
- [ ] Image cache: 1 year with `immutable`
- [ ] Cache-Control headers in `vercel.json`
- [ ] Service worker not blocking updates

### Code Splitting
- [ ] React vendor chunk separated
- [ ] Motion libraries in separate chunk
- [ ] Supabase in separate chunk
- [ ] Route-based code splitting (if applicable)
- [ ] Dynamic imports for heavy components

---

## ♿ Accessibility

### WCAG AA Compliance
- [ ] All text contrast ratio ≥ 4.5:1
- [ ] Large text contrast ratio ≥ 3:1
- [ ] Color not sole means of conveying information
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip to main content link (if applicable)

### Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical and intuitive
- [ ] No keyboard traps
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] Focus management in modals

### Screen Readers
- [ ] All images have descriptive `alt` text
- [ ] Decorative images use `aria-hidden="true"`
- [ ] All buttons have `aria-label` where needed
- [ ] Form inputs have associated labels
- [ ] Error messages announced
- [ ] Loading states announced

### Motion & Animation
- [ ] `prefers-reduced-motion` respected throughout
- [ ] Animations disable gracefully
- [ ] No auto-playing videos
- [ ] No flashing content (< 3 flashes per second)
- [ ] Parallax disabled for reduced motion users

---

## 🔍 SEO

### Meta Tags
- [ ] Page title set and descriptive (< 60 characters)
- [ ] Meta description present (< 160 characters)
- [ ] Viewport meta tag configured
- [ ] Charset meta tag present (UTF-8)
- [ ] Theme color set
- [ ] Language attribute on `<html>` tag

### Open Graph
- [ ] `og:title` matches page title
- [ ] `og:description` present and compelling
- [ ] `og:image` set to hero image
- [ ] `og:type` set to "website"
- [ ] `og:url` matches production URL
- [ ] Image dimensions correct (1200x630 recommended)

### Structured Data
- [ ] Organization schema (if applicable)
- [ ] Breadcrumb schema (if applicable)
- [ ] JSON-LD format used
- [ ] Validated with Google's Rich Results Test

### Sitemap & Robots
- [ ] `sitemap.xml` generated
- [ ] `robots.txt` configured
- [ ] No unintentional blocks in robots.txt
- [ ] Canonical URLs set

### Search Console
- [ ] Google Search Console verified
- [ ] Bing Webmaster Tools verified (optional)
- [ ] Submit sitemap to search engines

---

## 📊 Analytics & Monitoring

### Analytics Setup
- [ ] Vercel Analytics enabled
- [ ] Web Vitals tracking active
- [ ] Google Analytics 4 configured (optional)
- [ ] Custom events tracking important actions
- [ ] Privacy policy updated for analytics

### Error Tracking
- [ ] Sentry configured (optional)
- [ ] Error boundaries in React components
- [ ] Console errors logged
- [ ] 404 pages tracked
- [ ] API errors captured

### Monitoring
- [ ] Uptime monitoring enabled (UptimeRobot/Pingdom)
- [ ] Core Web Vitals monitored
- [ ] Real User Monitoring (RUM) active
- [ ] Alert thresholds configured

---

## 🧪 Testing

### Functional Testing
- [ ] All pages load correctly
- [ ] All links work (no 404s)
- [ ] Login modal opens and functions
- [ ] "Get Started" CTA scrolls correctly
- [ ] Cookie consent appears on first visit
- [ ] Cookie consent persists after acceptance
- [ ] All forms validate properly
- [ ] All buttons trigger expected actions

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet landscape (1024x768)
- [ ] Tablet portrait (768x1024)
- [ ] Mobile landscape (667x375)
- [ ] Mobile portrait (375x667)

### Performance Testing
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 95
- [ ] Lighthouse SEO = 100
- [ ] PageSpeed Insights green scores
- [ ] WebPageTest results acceptable

### Load Testing
- [ ] Site loads in < 2 seconds on 4G
- [ ] Site loads in < 4 seconds on 3G
- [ ] No timeout errors under load
- [ ] Database queries optimized
- [ ] API responses < 500ms

---

## 🌐 Content

### Homepage
- [ ] Hero section displays correctly
- [ ] All sections load and animate
- [ ] Images load with correct alt text
- [ ] Copy reviewed for typos
- [ ] CTAs are clear and actionable
- [ ] Brand colors consistent

### Legal & Compliance
- [ ] Privacy policy page exists
- [ ] Terms of service page exists
- [ ] Cookie policy compliant with GDPR
- [ ] Contact information accurate
- [ ] Copyright notice up to date

---

## 🚀 Deployment

### Pre-Deploy
- [ ] All changes committed to Git
- [ ] Commit messages descriptive
- [ ] Branch up to date with `main`
- [ ] No merge conflicts
- [ ] Code reviewed (if applicable)
- [ ] Staging deployment tested

### Vercel Configuration
- [ ] `vercel.json` present and correct
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node.js version: 18.x or higher
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)

### Post-Deploy Verification
- [ ] Deployment completes successfully
- [ ] No build errors or warnings
- [ ] Preview URL accessible
- [ ] Production URL accessible
- [ ] SSL certificate valid
- [ ] DNS resolves correctly

### Final Checks
- [ ] Run Lighthouse on production URL
- [ ] Check real device (not just DevTools)
- [ ] Verify analytics tracking
- [ ] Test login flow end-to-end
- [ ] Check error tracking working
- [ ] Monitor initial traffic

---

## 🔄 Rollback Plan

### If Issues Occur
- [ ] Identify issue quickly (monitoring alerts)
- [ ] Document issue in deployment log
- [ ] Decide: fix forward or rollback
- [ ] If rollback: use Vercel instant rollback
- [ ] Verify rollback successful
- [ ] Communicate status to stakeholders

### Post-Incident
- [ ] Root cause analysis
- [ ] Update checklist if needed
- [ ] Improve monitoring/alerts
- [ ] Document lessons learned

---

## ✅ Sign-Off

**Deployment Date**: ________________

**Deployed By**: ________________

**Reviewed By**: ________________

**Production URL**: ________________

**Notes**:
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

**All checks passed?** [ ] Yes [ ] No

If no, list blocking issues:
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

**This checklist must be completed before every production deployment.**

Last Updated: 2025-10-20

