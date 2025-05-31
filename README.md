# Showcase Gallery - Static Site

A beautiful, interactive presentation gallery built with Next.js that can be deployed as a static site to GitHub Pages or any static hosting service.

## Features

- 📱 Responsive design optimized for presentations
- 🎨 Rich text editing with formatting support
- 🖼️ Image cropping and management
- ⌨️ Keyboard navigation (Arrow keys)
- 💾 Local storage for configuration persistence
- 🎯 Static site generation for easy deployment

## Quick Start

### Local Development

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Static Deployment

This project is configured for static export and can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## GitHub Pages Deployment

### Automatic Deployment

1. **Update Configuration**: 
   - Edit `next.config.mjs` and replace `/your-repo-name` with your actual repository name
   - If your repository is named `showcase-gallery`, use `/showcase-gallery`

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

3. **Push to Main Branch**:
   \`\`\`bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   \`\`\`

4. **Access Your Site**:
   - Your site will be available at: `https://yourusername.github.io/your-repo-name`

### Manual Deployment

If you prefer manual deployment:

\`\`\`bash
# Build the static site
npm run build

# The static files will be in the 'out' directory
# Upload the contents of 'out' to your hosting service
\`\`\`

## Usage

### Presentation Mode
- Navigate to `/` to view the presentation
- Use arrow keys to navigate between slides
- Each module can have multiple features with rich content

### Admin Mode
- Navigate to `/admin` to edit the presentation
- Configure intro slide, modules, and thank you slide
- Upload and crop images for each feature
- Toggle module visibility
- Rich text editing for descriptions

### Keyboard Controls
- **↑/↓ Arrow Keys**: Navigate between slides and features
- **Escape**: Close modals and editors

## Configuration

The presentation configuration is stored in localStorage and includes:
- Intro slide (title, subtitle, hero image)
- Up to 10 modules with customizable:
  - Names and colors
  - Icons and visibility
  - Multiple features per module
- Thank you slide content

## Customization

### Adding New Icons
Edit `components/module-icon.tsx` to add new icon options:

\`\`\`typescript
const iconMap = {
  // Add your new icons here
  YourNewIcon,
  // ... existing icons
}
\`\`\`

### Styling
The project uses Tailwind CSS. Customize colors and styles in:
- `app/globals.css` for global styles
- Individual components for specific styling

## Browser Support

- Modern browsers with ES6+ support
- Local storage required for configuration persistence
- File API support for image uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your presentations!
