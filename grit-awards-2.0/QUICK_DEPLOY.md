# GRIT Awards - Quick Deploy Reference

## 🚀 Deploy in 5 Minutes

### Prerequisites
```bash
# 1. Ensure environment variables are set in Vercel Dashboard:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Deploy to Production
```bash
# Option A: Automatic (Recommended)
git add .
git commit -m "feat: Ready for production"
git push origin main
# Vercel deploys automatically ✅

# Option B: Manual
npm run deploy
```

---

## ✅ Quick Verification (3 commands)

```bash
# 1. Test build locally
npm run build
# Expected: ✓ built in ~3s, total ~174 KB gzipped

# 2. Preview locally
npm run preview
# Visit: http://localhost:4173

# 3. Run Lighthouse (after deploy)
npx lighthouse https://your-domain.vercel.app/ --view
# Expected: All scores ≥ 90
```

---

## 📦 What's Included

### Performance
- ✅ 174 KB gzipped (30% under 250 KB target)
- ✅ 3.3s build time
- ✅ Code splitting (React, Motion, Supabase)
- ✅ Optimized images (.webp, lazy loading)
- ✅ Async font loading

### Security
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ HTTPS enforced
- ✅ Environment variables secured
- ✅ No console logs in production

### Monitoring
- ✅ Web Vitals tracking
- ✅ Vercel Analytics ready
- ✅ Google Analytics 4 support
- ✅ Error tracking ready (Sentry)

### Accessibility
- ✅ WCAG AA compliant
- ✅ Keyboard navigation
- ✅ Reduced motion support
- ✅ ARIA labels complete

### SEO
- ✅ Meta tags + Open Graph
- ✅ Structured data ready
- ✅ Performance optimized
- ✅ Mobile responsive

---

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Deployment
npm run deploy:preview   # Deploy to Vercel preview
npm run deploy           # Deploy to Vercel production

# Maintenance
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
npm run audit            # Check for vulnerabilities
npm run clean            # Clean build artifacts
```

---

## 📊 Expected Performance

### Lighthouse Scores (Production)
```
Performance:     90+ ✅
Accessibility:   95+ ✅
Best Practices:  95+ ✅
SEO:            100  ✅
```

### Core Web Vitals
```
LCP (Largest Contentful Paint):  < 2.5s   ✅
FID (First Input Delay):          < 100ms  ✅
CLS (Cumulative Layout Shift):    < 0.1    ✅
```

### Bundle Size (Gzipped)
```
Total:          174 KB ✅
Main:            39 KB
React Vendor:    51 KB
Supabase:        34 KB
Motion:          41 KB
Web Vitals:       2 KB
CSS:              7 KB
```

---

## ⚠️ Before First Deploy

### In Vercel Dashboard
1. Go to **Settings** → **Environment Variables**
2. Add `VITE_SUPABASE_URL` (Production)
3. Add `VITE_SUPABASE_ANON_KEY` (Production)
4. Optional: Add `VITE_GA_MEASUREMENT_ID`
5. Go to **Analytics** → **Enable Analytics**

### In GitHub
1. Ensure repository connected to Vercel
2. Set default branch to `main`
3. Enable automatic deployments

---

## 🆘 Quick Troubleshooting

### Build Fails
```bash
npm run clean
npm install
npm run build
```

### Images Not Loading
- Check `/public` directory
- Verify paths start with `/`
- Confirm `.webp` format

### Env Variables Not Working
- Must start with `VITE_`
- Redeploy after adding
- Check scope (Production/Preview)

### Slow Performance
```bash
npm run build:analyze
# Check bundle sizes
```

---

## 📚 Full Documentation

- **Complete Guide**: `DEPLOYMENT.md`
- **Checklist**: `PRE_DEPLOYMENT_CHECKLIST.md`
- **Summary**: `DEPLOYMENT_SUMMARY.md`

---

## 🎉 You're Ready!

The GRIT Awards homepage is production-ready with:
- Optimized performance (174 KB gzipped)
- Complete security headers
- Analytics and monitoring
- WCAG AA accessibility
- Full SEO optimization

**Just push to `main` and Vercel handles the rest!**

---

**Quick Reference Version**: 1.0  
**Last Updated**: October 20, 2025

