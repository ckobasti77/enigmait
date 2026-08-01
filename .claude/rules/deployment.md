# Deployment

## Process

Before deploying, verify the build passes:

```bash
npm run build
```

If build succeeds, deploy with:

```bash
git add .
git commit -m "<short description of what changed + version if applicable>"
git push -u origin main
```

## Commit Message Format

Keep it as short as possible. Examples:
- `fix navbar mobile layout`
- `add contact form validation`
- `update hero copy v2.1`
- `new seo-geo service page`
