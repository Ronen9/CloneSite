# 🌐 CloneSite - Full-Screen Website Cloner

A beautiful, full-screen website cloning tool that captures and renders websites exactly as they appear, with a minimal Google-style interface.

![CloneSite Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18-blue)

## ✨ Features

- 🎯 **Full-Screen Rendering** - Cloned websites display in complete full-screen mode
- 🎨 **Minimal UI** - Clean, Google-inspired interface with just a search box
- 🚀 **Dual Scraping** - Firecrawl API + Direct HTML fetch for maximum compatibility
- 🌍 **Multi-Language Support** - Handles RTL languages (Hebrew, Arabic) perfectly
- 📱 **Responsive Design** - Works flawlessly on all screen sizes
- ⚡ **Fast Performance** - Optimized loading and rendering
- 🔒 **Secure** - Sandboxed iframe execution
- 🎛️ **One-Click Toggle** - Floating button to clone another site

## 🖼️ Screenshots

### Minimal Input Interface
Clean, distraction-free input screen with elegant styling.

### Full-Screen Clone Results
Perfect visual reproduction of original websites including:
- ✅ Original CSS styling and layout
- ✅ Images and graphics
- ✅ Typography and fonts  
- ✅ Navigation and interactive elements
- ✅ Responsive design
- ✅ Multi-language text rendering

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firecrawl API key (included)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ronen9/cloneSite.git
cd cloneSite
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development servers:**
```bash
npm run dev
```

4. **Open your browser:**
```
http://localhost:5180
```

## 🎯 Usage

1. **Enter a URL** in the search box (e.g., `stripe.com`, `github.com`)
2. **Click "Clone"** and wait for processing
3. **View full-screen clone** of the website
4. **Click floating button** to clone another site

### Example URLs to Try
- `stripe.com` - Modern SaaS design
- `github.com` - Developer platform
- `zap.co.il` - Hebrew e-commerce site
- `example.com` - Simple test page

## 🏗️ Architecture

### Frontend (React + Tailwind CSS)
- **Minimal Interface** - Clean search box with beautiful animations
- **Full-Screen Display** - Iframe-based rendering for perfect fidelity
- **Responsive Design** - Mobile-first approach

### Backend (Express.js + Node.js)
- **Dual Scraping Methods:**
  - **Firecrawl API** - Primary method for clean, structured HTML
  - **Direct HTML Fetch** - Fallback for maximum compatibility
- **HTML Enhancement** - URL fixing, CSS preservation, layout optimization
- **CORS Handling** - Proper cross-origin resource management

### File Structure
```
cloneSite/
├── homepage-clone/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── CloneInterface.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── api/                     # Vercel serverless functions
├── server.js               # Development backend server
├── fallback-scraper.js     # Direct HTML fetching
├── package.json            # Main dependencies
├── vercel.json            # Vercel deployment config
└── README.md
```

## 🌐 Deployment

### Development
```bash
npm run dev  # Starts both frontend and backend
```

### Production (Vercel)
```bash
npm i -g vercel
vercel
```

**Build Command:** `cd homepage-clone && npm install && npm run build`  
**Output Directory:** `homepage-clone/dist`

## 🔧 Configuration

### Environment Variables
- `FIRECRAWL_API_KEY` - Firecrawl API key (pre-configured)

### Customization
- **Styling:** Modify `homepage-clone/src/components/CloneInterface.jsx`
- **Backend Logic:** Update `server.js` or `api/clone.js`
- **Scraping Options:** Adjust parameters in `fallback-scraper.js`

## 🎯 Use Cases

- **Design Inspiration** - Study website layouts and designs
- **Competitive Analysis** - Analyze competitor websites
- **Client Presentations** - Show website examples in full-screen
- **Educational Purposes** - Learning web design patterns
- **Rapid Prototyping** - Quick design reference tool

## 🔒 Security & Ethics

- ✅ **Defensive Use Only** - Designed for legitimate design inspiration
- ✅ **No Data Collection** - Doesn't store or transmit user data
- ✅ **Sandboxed Execution** - Safe iframe rendering
- ✅ **Respects robots.txt** - Only processes publicly accessible content

**⚠️ Important:** Always respect website terms of service and use responsibly.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firecrawl** - Website scraping API
- **React** - Frontend framework
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool
- **Express.js** - Backend server

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

---

**Made with ❤️ for the web development community**