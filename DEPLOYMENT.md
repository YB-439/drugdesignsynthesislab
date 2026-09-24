# 🚀 Deployment Guide for drugdesignsynthesislab.com

This website is a zero-dependency, high-performance web application designed for the **Drug Design and Synthesis Lab**, Punjabi University, Patiala.

---

## 🌐 Connecting your domain `drugdesignsynthesislab.com`

### Option 1: Free GitHub Pages Hosting (Recommended)
1. Initialize a Git repository in this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Drug Design & Synthesis Lab website"
   ```
2. Create a repository on GitHub named `drugdesignsynthesislab` and push your code.
3. Go to **Repository Settings -> Pages**.
4. Set source to `main` (or `master`) branch.
5. Under **Custom Domain**, enter: `drugdesignsynthesislab.com` (a `CNAME` file is already pre-configured in this repository).
6. In your Domain Registrar (GoDaddy / Namecheap / Hostinger / Cloudflare):
   - Add **A Records** pointing `@` to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Add a **CNAME Record** for `www` pointing to `YOUR_GITHUB_USERNAME.github.io`.

---

### Option 2: Cloudflare Pages / Netlify / Vercel
1. Drag and drop this folder directly into [Netlify Drop](https://app.netlify.com/drop) or connect your GitHub repository.
2. Go to **Domain Management** -> Add Custom Domain -> `drugdesignsynthesislab.com`.
3. Update DNS CNAME / A records as instructed by Netlify / Cloudflare.

---

### Option 3: Traditional cPanel / Apache / Nginx Hosting
Simply upload all files in this directory (`index.html`, `CNAME`, `css/`, `js/`) into the `public_html` directory of your web server.
