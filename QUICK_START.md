# 🚀 TFG Gaming Club - Quick Start Guide

## Your Configuration

```
Domain:          TFG-Gaming.co.uk
Database:        tfggaming_site
Username:        tfggaming_host
MySQL Host:      localhost:3306
```

---

## 📝 Step-by-Step Deployment

### 1️⃣ Upload Files to cPanel

**Via SSH:**
```bash
# Compress application
cd /home/ubuntu/tfg_gaming_club/nextjs_space
tar -czf ~/tfg_app.tar.gz --exclude='node_modules' --exclude='.next' .

# Upload to server (replace 'username' with your cPanel username)
scp ~/tfg_app.tar.gz username@TFG-Gaming.co.uk:~/

# SSH into server
ssh username@TFG-Gaming.co.uk

# Extract in web directory
cd ~/public_html
tar -xzf ~/tfg_app.tar.gz
```

**Via File Manager:**
- Zip the `nextjs_space` folder
- Upload via cPanel File Manager
- Extract to `public_html`

---

### 2️⃣ Create .env File

```bash
cd ~/public_html

# Copy the template
cp .env.cpanel .env

# Secure it
chmod 600 .env

# Verify contents
cat .env
```

**Or manually create with this content:**
```env
DATABASE_URL="mysql://tfggaming_host:y51a)+-SSaKIq8(k@localhost:3306/tfggaming_site"
NEXTAUTH_SECRET="37lATkcdTM8AryISyw3xdQ2OAE220xpB"
NEXTAUTH_URL="https://TFG-Gaming.co.uk"
DISCORD_CLIENT_ID="1448691094153068747"
DISCORD_CLIENT_SECRET="2wJ0YPGtjqYdIHn0gdWS-3PM-ObMji_v"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/1448280601596530749/WiOF7w89TMdwy4xKHATuInUiTlJ1XE_Z_JK-RKbCEocPsli9bx-C8D_jY2t_SyrciPLN"
NODE_ENV="production"
```

---

### 3️⃣ Install Dependencies

```bash
cd ~/public_html
yarn install
# Wait 5-10 minutes for completion
```

---

### 4️⃣ Set Up Database

```bash
# Generate Prisma Client
yarn prisma generate

# Create tables
yarn prisma db push

# Add initial data
yarn prisma db seed
```

**What gets created:**
- ✓ All database tables
- ✓ Default games (40k, Necromunda, Bolt Action)
- ✓ Admin user (john@doe.com / johndoe123)
- ✓ 15 tables setting

---

### 5️⃣ Build Application

```bash
yarn build
# Wait for "Compiled successfully"
```

---

### 6️⃣ Configure Node.js in cPanel

1. **Log into cPanel**
2. **Find "Setup Node.js App"**
3. **Click "Create Application"**
4. **Configure:**
   - Node.js Version: `18.x` or higher
   - Application Mode: `Production`
   - Application Root: `public_html`
   - Application URL: `TFG-Gaming.co.uk`
   - Startup File: `server.js`
5. **Click "Create"**
6. **Click "Start App"**

---

### 7️⃣ Test Your Site

Visit: **https://TFG-Gaming.co.uk**

**First Steps:**
1. Register a new account
2. Log in
3. Create a test booking
4. Check Discord for notification

**Make Your Account Admin:**
```bash
cd ~/public_html

# Edit script with your Discord username
nano scripts/set-sneakyvale-admin.ts
# Change "Sneakyvale" to your Discord username

# Run it
yarn tsx --require dotenv/config scripts/set-sneakyvale-admin.ts
```

---

## 🔧 Essential Commands

### Restart Application
```bash
# Via cPanel Node.js App Manager
# Click "Restart App" button
```

### View Logs
```bash
# Application logs available in cPanel Node.js App Manager
# Or check error_log in your app directory
tail -f ~/public_html/error_log
```

### Update Application
```bash
cd ~/public_html

# Pull new code (or upload new files)

# Rebuild
yarn install
yarn prisma generate
yarn build

# Restart via cPanel
```

### Database Operations
```bash
# View database in browser
yarn prisma studio
# Opens on http://localhost:5555

# Reset database (WARNING: Deletes all data)
yarn prisma db push --force-reset
yarn prisma db seed
```

### Backup Database
```bash
mysqldump -u tfggaming_host -p tfggaming_site > backup_$(date +%Y%m%d).sql
# Enter password when prompted: y51a)+-SSaKIq8(k
```

---

## ⚠️ Troubleshooting

### 🚫 Application Won't Start

**Check Node.js Version:**
```bash
node --version
# Should be 18.x+
```

**Check Logs in cPanel:**
- Node.js App Manager → View Logs

**Common Issues:**
- Port conflict → Check if another app uses port 3000
- Missing dependencies → Run `yarn install` again
- Build failed → Run `yarn build` and check errors

---

### 🚫 Database Connection Failed

**Test Connection:**
```bash
mysql -h localhost -u tfggaming_host -p tfggaming_site
# Password: y51a)+-SSaKIq8(k
```

**Check .env File:**
```bash
cat .env | grep DATABASE_URL
# Should show: mysql://tfggaming_host:y51a)+-SSaKIq8(k@localhost:3306/tfggaming_site
```

**Verify Database Exists:**
- Log into cPanel
- MySQL Databases → Check `tfggaming_site` exists
- Check user `tfggaming_host` has ALL PRIVILEGES

---

### 🚫 Static Files Not Loading

```bash
# Check .next folder exists
ls -la .next/

# Fix permissions
chmod -R 755 .next public

# Rebuild
yarn build
```

---

### 🚫 HTTPS/SSL Issues

1. **Install SSL in cPanel:**
   - SSL/TLS section
   - Use AutoSSL or Let's Encrypt
   
2. **Force HTTPS:**
   Create/edit `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

---

## 📞 Support

### Documentation
- **Full Deployment Guide:** `CPANEL_DEPLOYMENT.md`
- **Data Migration:** `DATA_MIGRATION_GUIDE.md`
- **Detailed Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Configuration:** `PRODUCTION_CONFIG.txt`

### Resources
- cPanel Support: Your hosting provider
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs

---

## ✅ Post-Deployment Checklist

- [ ] Site loads at https://TFG-Gaming.co.uk
- [ ] Can register new account
- [ ] Can log in successfully
- [ ] Bookings page works
- [ ] Can create bookings
- [ ] Discord notifications working
- [ ] Admin panel accessible
- [ ] SSL/HTTPS enabled
- [ ] Changed default admin password
- [ ] Backups configured

---

## 🎯 Default Admin Credentials

**Use these to log in initially:**
```
Email:    john@doe.com
Password: johndoe123
```

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

---

## 📊 Monday Booking Notifications (Optional)

Set up cron job in cPanel:

```
Time: Every Monday at 5:00 PM
Command: cd /home/username/public_html && /usr/bin/node /usr/local/bin/yarn tsx --require dotenv/config scripts/scheduled/monday-booking-summary.ts
```

Schedule:
- Minute: `0`
- Hour: `17`
- Day: `*`
- Month: `*`
- Weekday: `1`

---

## 🚀 You're Ready!

Your TFG Gaming Club is configured and ready to deploy to:

**https://TFG-Gaming.co.uk**

Good luck! 🎮
