# Contributing to CloneSite

## ✅ Yes, Your Changes Will Apply to This Project!

**This repository IS your CloneSite project.** Any changes you commit and push to this repository will immediately be part of your CloneSite project. There's no separate deployment or synchronization needed for development changes.

## 📁 Repository Structure

This repository (`Ronen9/CloneSite`) contains the complete CloneSite application:

```
CloneSite/
├── homepage-clone/          # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/      # React components
│   │   │   └── CloneInterface.jsx  # Main UI component
│   │   ├── App.jsx          # Root component
│   │   └── main.jsx         # Entry point
│   └── package.json         # Frontend dependencies
├── api/                     # Vercel serverless functions
├── server.js                # Development backend server
├── fallback-scraper.js      # Fallback HTML fetching
├── package.json             # Root dependencies
└── vercel.json              # Deployment configuration
```

## 🔄 How Changes Work

### Local Development Changes
1. **Make your changes** to any file in the repository
2. **Test locally** using `npm run dev`
3. **Commit your changes** using `git commit`
4. **Push to GitHub** using `git push`
5. **Your changes are now live** in the repository!

### Example Workflow
```bash
# Make changes to a component
vim homepage-clone/src/components/CloneInterface.jsx

# Test your changes locally
npm run dev

# Stage and commit
git add .
git commit -m "Updated CloneInterface styling"

# Push to repository
git push origin main

# ✅ Changes are now in your CloneSite project!
```

## 🚀 Development Workflow

### Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd homepage-clone && npm install
```

### Run Development Server
```bash
# From root directory - starts both backend and frontend
npm run dev

# Backend runs on: http://localhost:3003
# Frontend runs on: http://localhost:5180
```

### Build for Production
```bash
# Build the frontend
npm run build

# Test production build
cd homepage-clone && npm run preview
```

### Run Linter
```bash
# Lint frontend code
cd homepage-clone && npm run lint

# Auto-fix linting issues
cd homepage-clone && npm run lint -- --fix
```

## 🎯 Common Tasks

### Adding a New Feature
1. Create a new branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test locally: `npm run dev`
4. Commit: `git commit -am "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Create a Pull Request on GitHub

### Fixing a Bug
1. Identify the issue
2. Create a fix branch: `git checkout -b fix/bug-description`
3. Make the fix
4. Test thoroughly: `npm run dev`
5. Run linter: `cd homepage-clone && npm run lint`
6. Commit and push

### Updating Styles
The project uses Tailwind CSS. Edit:
- `homepage-clone/src/components/CloneInterface.jsx` for component-specific styles
- `homepage-clone/src/index.css` for global styles
- `homepage-clone/tailwind.config.js` for Tailwind configuration

### Updating Backend Logic
- Edit `server.js` for the development backend
- Edit `api/clone.js` for the Vercel production backend
- Edit `fallback-scraper.js` for direct HTML fetching logic

## 🔍 Testing Your Changes

### Manual Testing
1. Start development server: `npm run dev`
2. Open browser: `http://localhost:5180`
3. Test website cloning with various URLs:
   - `stripe.com`
   - `github.com`
   - `example.com`
4. Verify the cloned site displays correctly
5. Check browser console for errors

### Build Testing
```bash
# Build the project
npm run build

# Preview the build
cd homepage-clone && npm run preview
```

## 🌐 Deployment

### Vercel (Production)
Changes pushed to the main branch are automatically deployed to Vercel:
1. Push to main: `git push origin main`
2. Vercel detects the change
3. Builds and deploys automatically
4. Your changes are live at your Vercel URL

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 📝 Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns
- Use ESLint recommendations

### Formatting
- 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects/arrays
- Keep lines under 100 characters when possible

## 🐛 Troubleshooting

### Changes Not Showing Up?
- **Local**: Make sure dev server is running (`npm run dev`)
- **Production**: Check Vercel deployment status
- Clear browser cache: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Build Errors?
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clean install frontend
cd homepage-clone
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use?
```bash
# Kill process on port 3003
kill $(lsof -t -i:3003)

# Kill process on port 5180
kill $(lsof -t -i:5180)
```

## 🤝 Getting Help

- Check existing issues on GitHub
- Review the README.md for project documentation
- Look at the code - it's well-commented!
- Ask questions by opening a GitHub issue

## ✨ Summary

**Yes, changes you make to this repository directly apply to your CloneSite project!** This repository contains all the source code, and any commits you make will be reflected in both your local development environment and (after deployment) your production site.

There's no synchronization or external configuration needed - you're working directly on the CloneSite project source code.

Happy coding! 🚀
