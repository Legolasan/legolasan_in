# DNS Setup Guide for legalasan.in

## Step 1: Access Your Domain Registrar

Log in to your domain registrar where you purchased `legalasan.in` (e.g., GoDaddy, Namecheap, Google Domains, etc.)

## Step 2: Find DNS Management

Look for:
- "DNS Management"
- "DNS Settings"
- "Manage DNS"
- "DNS Records"
- "Zone Editor"

## Step 3: Add A Records

You need to add **TWO** A records:

### Record 1: Root Domain
```
Type: A
Name: @ (or leave blank, or enter: legalasan.in)
Value: 195.35.22.87
TTL: 3600 (or use default)
```

### Record 2: WWW Subdomain
```
Type: A
Name: www
Value: 195.35.22.87
TTL: 3600 (or use default)
```

## Step 4: Save Changes

Click "Save" or "Add Record" for each record.

## Step 5: Verify DNS Propagation

After saving, DNS changes can take anywhere from a few minutes to 48 hours to propagate. Usually it's within 1-2 hours.

### Check DNS Propagation:

**On Mac/Linux:**
```bash
dig legalasan.in +short
dig www.legalasan.in +short
```

**On Windows:**
```bash
nslookup legalasan.in
nslookup www.legalasan.in
```

**Online Tools:**
- https://www.whatsmydns.net/
- https://dnschecker.org/

Both should return: `195.35.22.87`

## Step 6: Once DNS is Propagated

Once both domains point to `195.35.22.87`, proceed with SSL certificate setup (this will be done automatically in the deployment).

## Common Issues

- **"Can't find DNS settings"**: Look for "Advanced DNS" or contact your registrar support
- **"Record already exists"**: Delete the old record first, then add the new one
- **"Not resolving"**: Wait a bit longer, DNS propagation can be slow

## Next Steps

After DNS is set up and propagated, run the deployment script which will automatically set up SSL certificates.

