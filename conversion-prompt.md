# HTML to React + Tailwind CSS Conversion Prompt

## GOAL:
Convert the HTML content in `homepage-clone.html` into a clean React UI using Tailwind CSS.

## INSTRUCTIONS:
1. Split the layout into 3 main components:
   - **Header.jsx** - Navigation, logo, top section
   - **HomePage.jsx** - Main content area
   - **Footer.jsx** - Footer links, copyright, bottom section

2. **Styling Guidelines:**
   - Use Tailwind CSS for all styling
   - Remove all inline styles and external CSS references
   - Keep the visual layout similar, but simplify unnecessary tags (like redundant `<div>`s)
   - Use responsive design classes (sm:, md:, lg:, xl:)
   - Maintain proper spacing and typography hierarchy

3. **Content Preservation:**
   - Keep all links and headings intact
   - Preserve all text content
   - Maintain image src attributes (convert to proper imports if needed)
   - Keep navigation structure

4. **Component Structure:**
   - Use functional components with modern React patterns
   - Add proper prop types or TypeScript if needed
   - Include proper imports and exports
   - Use semantic HTML elements where appropriate

5. **Output Requirements:**
   - Provide complete, working React components
   - Structure them inside a main App.jsx file
   - Include necessary import statements
   - Add basic error handling for images/links

## EXPECTED APP STRUCTURE:
```jsx
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
}

export default App;
```

## INPUT HTML:
(Paste the contents of homepage-clone.html below this line)

---

## EXPECTED OUTPUT:
Please provide the following files in this exact order:

### 1. Header.jsx
```jsx
// Header component code here
```

### 2. HomePage.jsx  
```jsx
// HomePage component code here
```

### 3. Footer.jsx
```jsx
// Footer component code here
```

### 4. App.jsx
```jsx
// Main App component code here
```

### 5. components/ folder structure
Create a `src/components/` directory and place Header.jsx, HomePage.jsx, and Footer.jsx inside it.

## ADDITIONAL NOTES:
- Focus on creating a responsive, modern design
- Use Tailwind's utility classes for consistent spacing and colors
- Ensure accessibility with proper semantic HTML
- Test that all links and interactive elements work properly
- Convert any complex layouts to CSS Grid or Flexbox using Tailwind classes