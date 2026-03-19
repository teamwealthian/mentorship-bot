# Deployment Guide

This guide explains how to deploy this project on a single AWS EC2 server using:

- `Nginx` to serve the frontend and reverse-proxy API requests
- `PM2` to keep the backend running
- one EC2 instance for both frontend and backend

This project is deployed as:

- `frontend`: built with Vite into static files
- `backend`: Node.js / Express app running on port `5001`
- `Nginx`: serves `frontend/dist` and forwards `/api/*` to the backend

## Recommended Architecture

Use this production setup:

- Run the backend with `PM2`
- Build the frontend with `npm run build`
- Serve the frontend build output with `Nginx`
- Proxy `/api/` from `Nginx` to `http://127.0.0.1:5001`

Do not run the Vite dev server in production.

## Project Repository

GitHub repo:

- `https://github.com/teamwealthian/mentorship-bot.git`

## Server Requirements

Recommended starting EC2 instance:

- `Ubuntu 22.04 LTS` or `Ubuntu 24.04 LTS`
- `t3.small` or `t3.medium`
- at least `16 GB` disk

## AWS Setup

### 1. Launch an EC2 instance

In AWS Console:

1. Open `EC2`
2. Click `Launch instance`
3. Choose `Ubuntu Server 22.04 LTS` or `Ubuntu Server 24.04 LTS`
4. Select instance type `t3.small` or `t3.medium`
5. Create a key pair and download the `.pem` file
6. Create a security group with these inbound rules:
   - `SSH` port `22` from `My IP`
   - `HTTP` port `80` from `Anywhere`
   - `HTTPS` port `443` from `Anywhere`
7. Launch the instance

Important:

- Do not expose backend port `5001` publicly
- Keep only `80` and `443` public

### 2. Allocate and attach an Elastic IP

This gives your server a stable public IP.

1. Open `EC2`
2. Go to `Elastic IPs`
3. Click `Allocate Elastic IP`
4. Click `Associate Elastic IP`
5. Attach it to your new EC2 instance

## Connect to the Server

From your local machine:

```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@YOUR_ELASTIC_IP
```

## Install Required Software

Once connected to the server:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl nginx build-essential

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pm2
```

Verify installation:

```bash
node -v
npm -v
git --version
nginx -v
pm2 -v
```

## Clone the Project

Create an application directory and clone the repository:

```bash
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www

cd /var/www
git clone https://github.com/teamwealthian/mentorship-bot.git
cd mentorship-bot
```

If the repository is private, use a GitHub personal access token or SSH access.

## Install Dependencies

Install backend dependencies:

```bash
cd /var/www/mentorship-bot/backend
npm ci
```

Install frontend dependencies:

```bash
cd /var/www/mentorship-bot/frontend
npm ci
```

## Configure Environment Variables

Create the backend environment file:

```bash
nano /var/www/mentorship-bot/backend/.env
```

Use this template:

```env
PORT=5001
NODE_ENV=production
CORS_ORIGIN=http://YOUR_ELASTIC_IP
MONGODB_URI=your_mongodb_connection_string
ADMIN_USERNAME=your_internal_admin_username
ADMIN_PASSWORD=your_strong_internal_admin_password
JWT_SECRET=generate_a_long_random_secret_here
JWT_EXPIRES_IN=12h
OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
PINECONE_NAMESPACE=knowledge-base
RAG_TOP_K=5
RAG_SCORE_THRESHOLD=0.2
```

Notes:

- If you later use a domain with HTTPS, update `CORS_ORIGIN` to `https://yourdomain.com`
- Keep `.env` private
- Use a long, random `JWT_SECRET` in production and rotate it if it is ever exposed
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` control access to the internal admin console
- If `MONGODB_URI` is missing, the backend may still start, but admin knowledge saving may not work correctly

## Admin Access

The public website keeps `/` open for the chat experience. The internal admin console is no longer linked from the public home page.

To access the admin console after deployment:

1. Open `http://YOUR_ELASTIC_IP/admin/login`
2. Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. The frontend stores a JWT and sends it on `/api/admin/*` requests

If you change `ADMIN_USERNAME`, `ADMIN_PASSWORD`, or `JWT_SECRET`, restart the backend with:

```bash
cd /var/www/mentorship-bot/backend
pm2 restart mentorship-bot-backend --update-env
```

## Build the Frontend

Build the production frontend:

```bash
cd /var/www/mentorship-bot/frontend
npm run build
```

This creates:

- `/var/www/mentorship-bot/frontend/dist`

## Start the Backend with PM2

Run the backend with PM2:

```bash
cd /var/www/mentorship-bot/backend
pm2 start server.js --name mentorship-bot-backend
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs mentorship-bot-backend
pm2 restart mentorship-bot-backend
pm2 restart mentorship-bot-backend --update-env
pm2 stop mentorship-bot-backend
pm2 delete mentorship-bot-backend
```

Enable PM2 on server restart:

```bash
pm2 save
pm2 startup systemd
```

PM2 will print one extra command. Run that command once.

## Configure Nginx

Create an Nginx site config:

```bash
sudo nano /etc/nginx/sites-available/mentorship-bot
```

Paste this config:

```nginx
server {
    listen 80;
    server_name YOUR_ELASTIC_IP;

    root /var/www/mentorship-bot/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the config:

```bash
sudo ln -s /etc/nginx/sites-available/mentorship-bot /etc/nginx/sites-enabled/mentorship-bot
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

## Test the Deployment

### Test backend directly on the server

```bash
curl http://127.0.0.1:5001/api/health
```

### Test backend through Nginx

```bash
curl http://YOUR_ELASTIC_IP/api/health
```

### Open in the browser

Visit:

- `http://YOUR_ELASTIC_IP/`
- `http://YOUR_ELASTIC_IP/admin`

## Important Note About HTTP vs HTTPS

This frontend uses browser crypto APIs such as `crypto.randomUUID()`.

Some browsers restrict these APIs to secure contexts:

- `https://yourdomain.com`
- `http://localhost`

If you open the app using plain HTTP on a public IP, the frontend may crash and show a blank page.

If that happens, move to a real domain and enable HTTPS.

## Set Up a Domain and HTTPS

### 1. Point your domain to the EC2 Elastic IP

At your domain provider:

- Create an `A` record for `yourdomain.com`
- Create an `A` record for `www.yourdomain.com`
- Point both to your EC2 Elastic IP

### 2. Update Nginx config

Replace:

```nginx
server_name YOUR_ELASTIC_IP;
```

With:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

Then reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Install SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

After SSL is configured, update backend environment:

```env
CORS_ORIGIN=https://yourdomain.com
```

Then restart the backend:

```bash
cd /var/www/mentorship-bot/backend
pm2 restart mentorship-bot-backend --update-env
```

## How to Deploy Future Updates

When you push new code to GitHub, update the server like this:

### 1. Pull the latest code

```bash
cd /var/www/mentorship-bot
git pull origin main
```

If your default branch is not `main`, replace it with the correct branch name.

### 2. Reinstall dependencies if needed

```bash
cd /var/www/mentorship-bot/backend
npm ci

cd /var/www/mentorship-bot/frontend
npm ci
```

### 3. Rebuild the frontend

```bash
cd /var/www/mentorship-bot/frontend
npm run build
```

### 4. Restart the backend

```bash
cd /var/www/mentorship-bot/backend
pm2 restart mentorship-bot-backend --update-env
```

### 5. Reload Nginx

```bash
sudo systemctl reload nginx
```

## Quick Update Checklist

Use this sequence for routine deployments:

```bash
cd /var/www/mentorship-bot
git pull origin main

cd /var/www/mentorship-bot/backend
npm ci

cd /var/www/mentorship-bot/frontend
npm ci
npm run build

cd /var/www/mentorship-bot/backend
pm2 restart mentorship-bot-backend --update-env

sudo systemctl reload nginx
```

## Logs and Debugging

### PM2 logs

```bash
pm2 logs mentorship-bot-backend
```

### PM2 process list

```bash
pm2 status
```

### Nginx status

```bash
sudo systemctl status nginx
```

### Nginx error logs

```bash
sudo tail -f /var/log/nginx/error.log
```

### Nginx access logs

```bash
sudo tail -f /var/log/nginx/access.log
```

### Test Nginx config

```bash
sudo nginx -t
```

## Common Problems

### Blank page in browser

Possible causes:

- frontend build not generated
- wrong Nginx `root`
- JavaScript runtime error in browser
- browser crypto APIs blocked on plain HTTP

Check:

- browser console
- `pm2 logs mentorship-bot-backend`
- `sudo tail -f /var/log/nginx/error.log`

### `/api` requests fail

Possible causes:

- backend not running
- backend crashed due to missing env vars
- wrong `proxy_pass` configuration

Check:

```bash
curl http://127.0.0.1:5001/api/health
pm2 logs mentorship-bot-backend
```

### Page refresh gives 404 on `/admin`

Cause:

- missing SPA fallback in Nginx

Fix:

Make sure this exists in Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Changes in `.env` are not reflected

Restart PM2 with:

```bash
pm2 restart mentorship-bot-backend --update-env
```

## Security Notes

- Keep port `5001` private
- Allow SSH only from your IP
- Never commit `.env` files
- Use HTTPS in production
- Prefer a domain with SSL instead of raw HTTP on EC2 IP

## Final Recommended Production Flow

For this app, use this setup:

1. Clone repo on EC2
2. Install backend and frontend dependencies
3. Create `backend/.env`
4. Build frontend with `npm run build`
5. Start backend with `PM2`
6. Configure `Nginx` to serve frontend and proxy `/api`
7. Attach domain and enable HTTPS
8. Use `git pull`, rebuild, and restart for future deployments
