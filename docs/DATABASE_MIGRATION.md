# Database Migration Notes

## Remove Email Unique Constraint

If you have an existing `email_signups` table with a unique constraint on the email field, you'll need to remove it to allow multiple email submissions per user.

### Migration SQL

```sql
-- Remove unique constraint on email to allow multiple submissions
ALTER TABLE email_signups DROP CONSTRAINT IF EXISTS email_signups_email_key;
```

### Reason
Users should be able to receive multiple emails with their drink matches, not be limited to just one submission per email address.

### Impact
- Allows the same email to be used multiple times
- Users can save different preference combinations
- Better user experience for repeat visitors