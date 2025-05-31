# Deployment Guide

This guide covers different ways to deploy your Showcase Gallery as a static site.

## GitHub Pages (Recommended)

### Prerequisites
- GitHub account
- Repository with your code

### Setup Steps

1. **Configure Repository Name**
   \`\`\`javascript
   // In next.config.mjs, update:
   basePath: process.env.NODE_ENV === 'production' ? '/your-actual-repo-name' : '',
   assetPrefix: process.env.NODE_ENV === 'production' ? '/your-actual-repo-name/' : '',
   \`\`\`

2. **Enable GitHub Actions**
   - The `.github/workflows/deploy.yml` file is already configured
   - Push your code to the `main` branch

3. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - Save the configuration

4. **Deploy**
   \`\`\`bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   \`\`\`

Your site will be available at: `https://yourusername.github.io/repository-name`

## Netlify

### Option 1: Git Integration
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `out`
4. Deploy

### Option 2: Manual Upload
1. Run `npm run build` locally
2. Upload the `out` folder to Netlify

## Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js and configure the build
3. The static export will be handled automatically

## Other Static Hosts

For services like AWS S3, Firebase Hosting, or any static host:

1. **Build the site**:
   \`\`\`bash
   npm run build
   \`\`\`

2. **Upload the `out` directory** to your hosting service

3. **Configure routing** (if needed):
   - Ensure your host serves `index.html` for all routes
   - Some hosts call this "SPA mode" or "single page application"

## Custom Domain

### GitHub Pages
1. Add a `CNAME` file to your repository root with your domain
2. Configure DNS to point to GitHub Pages
3. Enable HTTPS in repository settings

### Other Hosts
Follow your hosting provider's custom domain documentation.

## Environment Variables

For static sites, environment variables must be set at build time:

\`\`\`bash
# Example for different environments
NODE_ENV=production npm run build
\`\`\`

## Troubleshooting

### Images Not Loading
- Ensure image paths are relative
- Check that images are in the `public` directory
- Verify `basePath` configuration for subdirectory deployments

### 404 Errors
- Verify `trailingSlash: true` in `next.config.mjs`
- Check that your host serves `index.html` for all routes

### Build Failures
- Ensure all dependencies are in `package.json`
- Check that Node.js version matches your local development
- Review build logs for specific error messages

## Performance Tips

1. **Optimize Images**: Use appropriate image formats and sizes
2. **Enable Compression**: Most hosts support gzip compression
3. **CDN**: Consider using a CDN for better global performance
4. **Caching**: Configure appropriate cache headers

## Security Considerations

- No server-side code means reduced attack surface
- All data is stored client-side in localStorage
- Consider implementing Content Security Policy headers
- Use HTTPS for production deployments
