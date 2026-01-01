# Artist's Color Wheel - PWA Installation Guide

A beautiful, offline-capable color harmony explorer for your art projects!

## Features ✨

- **Interactive Color Wheel** - Tap anywhere to select colors
- **Color Harmonies** - Complementary, Analogous, Triadic, Split Complementary, Tetradic, and Square
- **Pick from Photos** - Extract colors from your photos
- **Hex Input** - Enter specific color codes
- **Click to Switch** - Tap any harmony color to make it your new base
- **Works Offline** - Use anywhere, anytime after installation
- **Mobile Optimized** - Perfect for iPhone and iPad

## Installation Instructions 📱

### Step 1: Host the Files Online

You need to host these files on a web server. Here are your easiest options:

#### Option A: Netlify (Recommended - Easiest!)
1. Go to https://app.netlify.com/drop
2. Drag the entire `color-wheel-app` folder onto the page
3. Netlify will give you a URL like `https://random-name-12345.netlify.app`

#### Option B: GitHub Pages
1. Create a new repository on GitHub
2. Upload all files from the `color-wheel-app` folder
3. Go to Settings > Pages
4. Enable GitHub Pages
5. Your URL will be `https://yourusername.github.io/repository-name`

#### Option C: Your WordPress Hosting
1. Upload the `color-wheel-app` folder to your web hosting
2. Access it via `https://yourwebsite.com/color-wheel-app/`

### Step 2: Install on Your iPhone

1. **Open Safari** on your iPhone (must use Safari, not Chrome)
2. **Visit the URL** from Step 1
3. **Tap the Share button** (the square with an arrow pointing up)
4. **Scroll down and tap "Add to Home Screen"**
5. **Name it** (e.g., "Color Wheel") and tap "Add"

That's it! The app icon will appear on your home screen like a regular app.

### Step 3: Use Offline! 🎉

After installation, the app works completely offline. You can:
- Use it on airplane mode
- Use it anywhere without internet
- Use it without any data connection

The app caches everything on your phone during the first visit, so it's always available!

## How to Use 🎨

### Selecting Colors
- **Tap the wheel** - Pick any color directly from the color wheel
- **Enter hex code** - Type a color code like #FF6B6B and tap "Apply"
- **Pick from photo** - Tap "Pick color from photo", upload an image, then tap anywhere on it

### Exploring Harmonies
- Tap the harmony buttons (Complementary, Analogous, etc.) to see different color schemes
- Each harmony shows you related colors that work well together

### Switching Colors
- **Tap any harmony color** to make it your new primary color
- The wheel updates and shows new harmonies based on that color
- Keep exploring to discover your perfect palette!

### Copying Colors
- Tap any color swatch to view its hex code
- The hex code is also displayed and can be copied from the input field

## Troubleshooting 🔧

**App won't install?**
- Make sure you're using Safari (not Chrome or another browser)
- Check that you're viewing the HTTPS version of the URL
- Try refreshing the page before installing

**App not working offline?**
- Visit the app once while online to cache all files
- Make sure you've installed it via "Add to Home Screen"
- Try deleting and reinstalling

**Colors look different on different devices?**
- This is normal - screens have different color profiles
- The hex codes will always be accurate

## Technical Details 🛠️

- Built as a Progressive Web App (PWA)
- Uses Service Workers for offline functionality
- Pure JavaScript - no frameworks needed
- Optimized for mobile touch interactions
- Follows iOS design guidelines

## Need Help?

If you run into issues, your husband can help with:
- Hosting the files (Step 1)
- Troubleshooting any technical problems

Enjoy creating beautiful color palettes! 🌈
