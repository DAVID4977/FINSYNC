# Deployment Examples

## Quick Deployment Commands

### 1. Using Python HTTP Server (Local Testing)
```bash
# Navigate to the folder containing index.html
cd standalone-government-portal

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Access at: http://localhost:8000
```

### 2. Using Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Navigate to folder and serve
cd standalone-government-portal
http-server

# Access at: http://localhost:8080
```

### 3. Using PHP Built-in Server
```bash
cd standalone-government-portal
php -S localhost:8000

# Access at: http://localhost:8000
```

## Cloud Hosting Options

### 1. Netlify Drop (Instant)
1. Visit [netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `index.html` file
3. Get instant live URL

### 2. Surge.sh (Command Line)
```bash
# Install surge globally
npm install -g surge

# Deploy
cd standalone-government-portal
surge

# Follow prompts for domain
```

### 3. GitHub Pages
```bash
# Create repository
git init
git add index.html README.md
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/gst-portal.git
git push -u origin main

# Enable Pages in GitHub repository settings
```

### 4. Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and init
firebase login
firebase init hosting

# Deploy
firebase deploy
```

### 5. AWS S3 Static Website
```bash
# Using AWS CLI
aws s3 mb s3://your-gst-portal-bucket
aws s3 website s3://your-gst-portal-bucket --index-document index.html
aws s3 cp index.html s3://your-gst-portal-bucket
aws s3api put-bucket-policy --bucket your-gst-portal-bucket --policy file://bucket-policy.json
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run
```bash
docker build -t gst-portal .
docker run -p 8080:80 gst-portal
```

## Production Considerations

1. **SSL Certificate**: Use HTTPS for production
2. **CDN**: Consider using CloudFlare or AWS CloudFront
3. **Analytics**: Add Google Analytics if needed
4. **SEO**: Add meta tags for search engine optimization
5. **Monitoring**: Set up uptime monitoring

## Custom Domain Setup

Most hosting providers offer custom domain support:
1. Purchase domain from registrar
2. Point DNS to hosting provider
3. Configure SSL certificate
4. Update hosting settings

---

Choose the deployment method that best fits your needs and technical expertise.