# Email Setup Guide with Resend

## Quick Start (Using Resend's Domain)

For immediate testing, you can use Resend's default domain:

1. **Environment Variable**: Leave `FROM_EMAIL` unset or use:
   ```bash
   FROM_EMAIL="Drink Wizard <onboarding@resend.dev>"
   ```

2. **Limitation**: 100 emails/day with Resend branding

## Production Setup (Your Own Domain)

### Step 1: Choose Your Domain/Subdomain

**Recommended**: Use a subdomain like `notifications.yourdomain.com` or `noreply.yourdomain.com`

**Why subdomain?**
- Better reputation management
- Separate transactional from marketing emails
- Easier troubleshooting

### Step 2: Add Domain to Resend

1. Log into [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your subdomain (e.g., `notifications.yourdomain.com`)
4. Click "Add Domain"

### Step 3: Configure DNS Records

You'll need to add 3 DNS records to your domain provider:

#### MX Record
- **Type**: MX
- **Name**: `send` (or `send.notifications` if using subdomain)
- **Value**: `feedback-smtp.us-east-1.amazonses.com`
- **Priority**: 10

#### SPF Record (TXT)
- **Type**: TXT
- **Name**: `send` (or `send.notifications` if using subdomain)  
- **Value**: `"v=spf1 include:amazonses.com ~all"`

#### DKIM Record (TXT)
- **Type**: TXT
- **Name**: `resend._domainkey` (or `resend._domainkey.notifications` if using subdomain)
- **Value**: Copy from Resend dashboard (starts with `p=MIG...`)

### Step 4: Verify Domain

1. Go back to Resend dashboard
2. Click "Verify DNS Records"
3. Wait for verification (can take up to 72 hours, usually much faster)

### Step 5: Update Environment Variables

Once verified, update your `.env.local`:

```bash
FROM_EMAIL="Drink Wizard <hello@notifications.yourdomain.com>"
```

## Domain Provider Specific Guides

### Vercel Domains
Follow the [Vercel DNS setup guide](https://resend.com/docs/knowledge-base/dns-guides/vercel)

### Cloudflare
1. Go to DNS tab in Cloudflare
2. Add the 3 records above
3. Make sure proxy is **disabled** (gray cloud) for email records

### Namecheap
1. Go to Advanced DNS tab
2. Add records as shown above
3. TTL can be set to Automatic

### GoDaddy
1. Go to DNS Management
2. Add records with appropriate types
3. Use @ for root domain references

## Testing Your Setup

### Test Email Delivery

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "hello@notifications.yourdomain.com",
    "to": ["your-test-email@gmail.com"],
    "subject": "Test Email",
    "html": "<p>This is a test email</p>"
  }'
```

### Check Domain Status

Visit your Resend dashboard to confirm:
- ✅ Domain is verified
- ✅ DNS records are valid
- ✅ No warnings or errors

## Troubleshooting

### Domain Not Verifying

1. **Check DNS propagation**: Use tools like [DNS Checker](https://dnschecker.org/)
2. **Wait longer**: DNS can take up to 72 hours
3. **Check record format**: Ensure no extra characters or spaces
4. **Contact support**: Resend has excellent support

### Emails Going to Spam

1. **Warm up your domain**: Start with low volume
2. **Check SPF/DKIM**: Ensure records are correct
3. **Monitor reputation**: Use tools like [Mail Tester](https://www.mail-tester.com/)
4. **Avoid spam words**: Review email content

### Common Errors

- **"Domain not verified"**: DNS records not propagated yet
- **"Invalid from address"**: Using wrong subdomain
- **"Rate limited"**: Sending too many emails too quickly

## Production Best Practices

1. **Monitor deliverability**: Track open rates and bounces
2. **Handle unsubscribes**: Add unsubscribe links for marketing emails
3. **Segment sending**: Use different subdomains for different purposes
4. **Regular health checks**: Monitor DNS and domain status

## Current Configuration

Your app is configured to:
- Use `FROM_EMAIL` environment variable
- Fall back to `onboarding@resend.dev` for testing
- Send personalized drink match emails
- Handle email failures gracefully