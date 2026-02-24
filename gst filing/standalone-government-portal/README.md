# Government GST Portal - Standalone Version

This is a standalone version of the Government GST Portal webpage that can be hosted independently without any dependencies.

## Features

- **Responsive Design**: Works on all devices (desktop, tablet, mobile)
- **Government-Style Interface**: Authentic look and feel matching official GST portal
- **Multi-Step Workflow**: Login → Dashboard → Returns → Upload process
- **File Upload Simulation**: Interactive file upload with progress bar
- **Form Validation**: Input validation for forms and file uploads
- **Interactive Navigation**: Smooth transitions between pages

## File Structure

```
standalone-government-portal/
├── index.html          # Main standalone HTML file
├── README.md          # This documentation
└── deploy/            # Deployment instructions and examples
```

## How to Use

### Option 1: Local Testing
1. Open `index.html` directly in any modern web browser
2. The page will work completely offline

### Option 2: Web Hosting
1. Upload `index.html` to any web hosting service
2. Access via your domain/hosting URL

### Option 3: GitHub Pages (Free Hosting)
1. Create a new GitHub repository
2. Upload `index.html` to the repository
3. Enable GitHub Pages in repository settings
4. Access via `https://yourusername.github.io/repository-name`

### Option 4: Netlify (Free Hosting)
1. Visit [Netlify](https://netlify.com)
2. Drag and drop the `index.html` file
3. Get instant deployment with custom URL

### Option 5: Vercel (Free Hosting)
1. Visit [Vercel](https://vercel.com)
2. Import the folder or upload the file
3. Get instant deployment

## Usage Instructions

1. **Login Page**: Enter any username and password to proceed
2. **Dashboard**: Select financial year, quarter, and period, then click SEARCH
3. **Returns Page**: Choose a GST return type (GSTR1 or GSTR3B) and click UPLOAD
4. **Upload Page**: Select an Excel file (.xlsx or .xls) and click SUBMIT RETURN

## Technical Details

- **Framework**: Pure HTML, CSS, and JavaScript (no dependencies)
- **Styling**: Tailwind CSS (loaded via CDN)
- **File Size**: ~15KB (single file)
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Responsive**: Yes
- **Offline Capable**: Yes (after initial load)

## Customization

You can easily customize:
- Colors by modifying CSS variables
- Content by editing HTML sections
- Functionality by updating JavaScript

## Security Note

This is a demo/mock portal interface. Do not use for actual government submissions. For real GST filing, use the official government portal at https://gst.gov.in

## Support

For issues or customizations, refer to the original project repository.

---

**Disclaimer**: This is a demonstration interface and not affiliated with the Government of India GST portal.