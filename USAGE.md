# 🎯 Homepage Cloner - Usage Instructions

## 🚀 How to Test the Final Application

### 1. **Start the Application**
```bash
cd C:\Users\rehrenreich\CloneSite
npm run dev
```

This command starts both:
- Backend API server on `http://localhost:3001`
- Frontend React app on `http://localhost:5175`

### 2. **Access the Application**
Open your browser and go to: **http://localhost:5175**

### 3. **Using the Homepage Cloner**

#### **Google-Style Interface**
You'll see a clean, Google-inspired interface with:
- Large "Homepage Cloner" title
- Search input box for entering URLs
- "Clone Website" button
- Quick example buttons (stripe.com, github.com, example.com)

#### **How to Clone a Website**
1. **Enter a URL** in the search box:
   - `stripe.com` (protocol will be added automatically)
   - `https://github.com`
   - `example.com`

2. **Click "Clone Website"** or press Enter

3. **Wait for processing** - you'll see a loading spinner

4. **View Results** - Success shows:
   - ✅ Success message
   - URL that was cloned
   - File size
   - Live preview of the cloned content

#### **Quick Test Examples**
Click these example buttons to quickly test:
- **stripe.com** - Complex modern website
- **github.com** - Developer platform
- **example.com** - Simple test page

### 4. **What Happens Behind the Scenes**

1. **URL Processing**: Adds https:// if missing
2. **Firecrawl API Call**: Extracts clean HTML from the target website
3. **Content Processing**: Converts to viewable HTML format
4. **Preview Generation**: Shows live preview in the interface

### 5. **Features**

#### **✅ Working Features**
- ✅ Google-style search interface
- ✅ Real-time website cloning
- ✅ Live preview of cloned content
- ✅ Error handling and feedback
- ✅ Loading states and animations
- ✅ Responsive design
- ✅ Quick example buttons

#### **🎨 Interface Elements**
- Clean, minimal design
- Tailwind CSS styling
- Hover effects and transitions
- Success/error message display
- Loading spinner animations

### 6. **API Endpoints**

The backend provides these endpoints:
- `POST /api/clone` - Clone a website
- `GET /api/health` - Health check

### 7. **Troubleshooting**

#### **If servers don't start:**
```bash
# Kill any existing processes on ports 3001/5175
# Then restart
npm run dev
```

#### **If cloning fails:**
- Check internet connection
- Verify URL is accessible
- Some websites may block scraping
- Check console for detailed error messages

### 8. **Example Test Flow**

1. Open `http://localhost:5175`
2. Click "example.com" quick button
3. Click "Clone Website"
4. See success message with preview
5. Try "stripe.com" for a more complex example

### 9. **Development URLs**

- **Frontend:** http://localhost:5175
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 🎉 Ready to Use!

Your homepage cloner is now fully functional with a beautiful Google-style interface. Users can enter any website URL and get an instant clone with live preview!

### **Perfect for:**
- Design inspiration
- Layout analysis  
- Educational purposes
- Rapid prototyping

**Enjoy your homepage cloner! 🚀**