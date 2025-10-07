# Deployment Guide

This project contains a React frontend (Vite) and a Node.js/Express backend using MongoDB and Nodemailer.

Summary recommendation
- Frontend: Deploy on Vercel (or Netlify) — best for static / SPA sites built with Vite.
- Backend: Deploy on Render, Railway, or Heroku — these platforms support long-running Node servers and persistent connections to MongoDB.

1) Push code to GitHub (from your local machine)

If you haven't already connected this local repo to GitHub, run:

```bash
git remote add origin https://github.com/Husban-Ali/Office-Dashboard.git
git branch -M main
git add -A
git commit -m "chore: initial commit"
git push -u origin main
```

If push fails with authentication errors, create a GitHub Personal Access Token (PAT) and use it as your password, or set up SSH keys. See GitHub docs: https://docs.github.com/en/authentication

2) Frontend — Vercel

- In your GitHub repo, go to Vercel and import the project.
- Build settings (Vite):
  - Framework Preset: Vite
  - Build Command: npm run build
  - Output Directory: dist
  - Install Command: npm install
- Environment variables: set FRONTEND_URL to your backend's public URL (e.g., https://api.yourdomain.com)
- After deploy, Vercel will provide a URL for your frontend.

3) Backend — Render (recommended) or Railway

Render (quick steps):

- Create a new Web Service on Render.
- Connect your GitHub repo and select the backend folder (root in this repo).
- Environment:
  - Node version: >=16
  - Start Command: npm start
  - Build Command: (none) or leave empty if you don't build server
  - Env vars: add values from your `.env` (MONGO_URI, JWT_SECRET, SMTP_*, MAIL_FROM_* etc.)
- Ensure `MONGO_URI` points to your MongoDB Atlas cluster and that Atlas allows Render's IPs (or use VPC peering / SRV connection string).

Railway (alternative):
- Create a new project, link GitHub repo, and set the start command to `npm start`.
- Add environment variables via the Railway dashboard.

4) Notes & security

- Never commit real secrets. Use the provided `.env.example` as a template.
- If you accidentally committed secrets, rotate them immediately (change passwords, API keys).
- Set `FRONTEND_URL` in the backend's environment to your frontend production URL so email templates and links are correct.

5) Verifying email sending

- In production, make sure SMTP credentials are valid and the provider allows sending from your `MAIL_FROM_EMAIL`.
- Check logs on Render/Railway for errors when sending email.

6) Optional: Custom domain and HTTPS

- Use Vercel to add a custom domain for frontend.
- Use Render's custom domains for backend if required.
