# TFG Gaming Club - Deployment Checklist

## Pre-Deployment Verification

### ✅ Database Configuration
- [x] MySQL database created: `tfggaming_site`
- [x] Database user created: `tfggaming_host`
- [x] User has ALL PRIVILEGES on database
- [x] Connection string configured

### ✅ Application Files Ready
- [x] Prisma schema updated for MySQL
- [x] Server.js created for cPanel
- [x] Environment variables documented
- [x] Production configuration prepared

---

## Deployment Steps

### Step 1: Upload Application Files

**Option A: Via SSH (Recommended)**
```bash
# From your local machine
cd /home/ubuntu/tfg_gaming_club/nextjs_space

# Compress excluding node_modules
tar -czf tfg_gaming_app.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  .

# Upload to cPanel (replace with your details)
scp tfg_gaming_app.tar.gz username@TFG-Gaming.co.uk:~/

# SSH into cPanel
ssh username@TFG-Gaming.co.uk

# Extract in your web directory
cd ~/public_html  # or your app directory
tar -xzf ~/tfg_gaming_app.tar.gz
```

**Option B: Via cPanel File Manager**
1. Compress the application folder locally
2. Upload via File Manager
3. Extract in public_html or app directory

---

### Step 2: Create .env File on Server

**Via SSH:**
```bash
cd ~/public_html  # or your app directory

# Create .env file
cat > .env << 'EOF'
DATABASE_URL="mysql://tfggaming_host:y51a)+-SSaKIq8(k@localhost:3306/tfggaming_site"
NEXTAUTH_SECRET="37lATkcdTM8AryISyw3xdQ2OAE220xpB"
NEXTAUTH_URL="https://TFG-Gaming.co.uk"
DISCORD_CLIENT_ID="1448691094153068747"
DISCORD_CLIENT_SECRET="2wJ0YPGtjqYdIHn0gdWS-3PM-ObMji_v"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/1448280601596530749/WiOF7w89TMdwy4xKHATuInUiTlJ1XE_Z_JK-RKbCEocPsli9bx-C8D_jY2t_SyrciPLN"
NODE_ENV="production"
EOF

# Secure the file
chmod 600 .env
```

**Via cPanel File Manager:**
1. Navigate to your app directory
2. Click "+ File" to create new file
3. Name it `.env`
4. Edit and paste content from `PRODUCTION_CONFIG.txt`
5. Save

---

### Step 3: Install Dependencies

```bash
cd ~/public_html  # or your app directory

# Install Node.js dependencies
yarn install

# This may take 5-10 minutes
# Wait for completion before proceeding
```

---

### Step 4: Set Up Database

```bash
# Generate Prisma Client for MySQL
yarn prisma generate

# Push schema to create tables
yarn prisma db push

# Seed initial data (games, settings, admin user)
yarn prisma db seed
```

**Expected Output:**
- ✓ Database tables created
- ✓ Default games added (Warhammer 40k, Necromunda, Bolt Action)
- ✓ Admin user created
- ✓ Settings initialized (15 tables)

---

### Step 5: Build Application

```bash
# Build for production
yarn build

# This creates optimized .next folder
# Wait for "Compiled successfully" message
```

---

### Step 6: Configure Node.js App in cPanel

1. Log into cPanel
2. Find **Setup Node.js App** (under Software section)
3. Click **Create Application**
4. Configure:
   - **Node.js Version**: 18.x or higher (select latest available)
   - **Application Mode**: Production
   - **Application Root**: Path to your app (e.g., `public_html`)
   - **Application URL**: `TFG-Gaming.co.uk` or your subdomain
   - **Application Startup File**: `server.js`
   - **Environment Variables**: (These should be in .env file, but you can add here too)
5. Click **Create**

---

### Step 7: Start Application

1. In Node.js App Manager, find your application
2. Click **Start App** or **Restart App**
3. Wait for status to show "Running"
4. Note the assigned port (usually shown in interface)

---

### Step 8: Configure Apache/Passenger (If Needed)

cPanel usually auto-configures this, but verify:

**Check .htaccess in your app root:**
```apache
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

*(Replace 3000 with actual port if different)*

---

### Step 9: Set Up Admin User

**Option A: Use Default Seeded Admin**
- Email: `john@doe.com`
- Password: `johndoe123`
- Log in and change password immediately

**Option B: Make Your Own User Admin**

1. Register a new account via website
2. SSH into server:
```bash
cd ~/public_html

# Edit the script to match your username
nano scripts/set-sneakyvale-admin.ts
# Change "Sneakyvale" to your Discord username

# Run the script
yarn tsx --require dotenv/config scripts/set-sneakyvale-admin.ts
```

---

### Step 10: Configure Cron Jobs (Optional)

For Monday booking summary notifications:

1. In cPanel, go to **Cron Jobs**
2. Click **Advanced (Unix Style)**
3. Add new cron job:
   - **Minute**: 0
   - **Hour**: 17
   - **Day**: *
   - **Month**: *
   - **Weekday**: 1 (Monday)
   - **Command**: 
     ```bash
     cd /home/username/public_html && /usr/bin/node /usr/local/bin/yarn tsx --require dotenv/config scripts/scheduled/monday-booking-summary.ts
     ```
   *(Adjust paths to match your setup)*

---

### Step 11: Test Your Deployment

**Basic Tests:**
- [ ] Visit https://TFG-Gaming.co.uk - Homepage loads
- [ ] Register a new account
- [ ] Log in successfully
- [ ] View bookings page
- [ ] Create a test booking
- [ ] Check Discord for notification
- [ ] Access admin panel (if admin)

**Admin Tests:**
- [ ] Manage users
- [ ] Add/remove games
- [ ] View payment logs
- [ ] Update settings
- [ ] View statistics

---

## Troubleshooting

### Application Won't Start

**Check Node.js Version:**
```bash
node --version
# Should be 18.x or higher
```

**Check Application Logs:**
- In cPanel Node.js App Manager
- Look for error messages

**Common Issues:**
- Port already in use → Change in server.js
- Module not found → Run `yarn install` again
- Database connection failed → Check .env credentials

### Database Connection Errors

**Test MySQL Connection:**
```bash
mysql -h localhost -u tfggaming_host -p tfggaming_site
# Enter password: y51a)+-SSaKIq8(k
```

**Common Issues:**
- Wrong password → Double-check .env file
- User lacks privileges → Grant ALL PRIVILEGES in cPanel
- Database doesn't exist → Verify database name in cPanel

### Static Files Not Loading

**Check File Permissions:**
```bash
chmod -R 755 .next public
```

**Ensure .next Folder Exists:**
```bash
ls -la .next/
# Should see build artifacts
```

### SSL/HTTPS Issues

**Install SSL Certificate:**
1. In cPanel, go to **SSL/TLS**
2. Use **AutoSSL** or **Let's Encrypt**
3. Enable for your domain

**Force HTTPS:**
Add to .htaccess:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Post-Deployment

### Security
- [ ] Change default admin password
- [ ] Secure .env file (chmod 600)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up regular backups

### Monitoring
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Check application logs regularly
- [ ] Monitor database size
- [ ] Track error rates

### Maintenance
- [ ] Schedule regular backups
- [ ] Plan for updates
- [ ] Document custom configurations
- [ ] Keep dependencies updated

---

## Support Resources

- **cPanel Documentation**: Your hosting provider's knowledge base
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Node.js on cPanel**: Contact your hosting support

---

## Emergency Contacts

- **Hosting Support**: Contact your cPanel hosting provider
- **Application Issues**: Check CPANEL_DEPLOYMENT.md
- **Database Issues**: Check DATA_MIGRATION_GUIDE.md

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Notes**: _______________

---

✅ **Deployment Complete!**

Your TFG Gaming Club application should now be live at:
https://TFG-Gaming.co.uk

🎮 Happy Gaming!
