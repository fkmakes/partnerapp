const pool = require('./config');

async function migrateToPartners() {
  const client = await pool.connect();

  try {
    console.log('Starting migration from users to partners...');

    // Rename table
    await client.query('ALTER TABLE users RENAME TO partners');
    console.log('Renamed table: users -> partners');

    // Drop old constraint
    await client.query('ALTER TABLE partners DROP CONSTRAINT IF EXISTS users_user_type_check');
    console.log('Dropped old constraint');

    // Rename user_type column to partner_type
    await client.query('ALTER TABLE partners RENAME COLUMN user_type TO partner_type');
    console.log('Renamed column: user_type -> partner_type');

    // Update existing data: change 'user' to 'partner' in partner_type
    await client.query(`UPDATE partners SET partner_type = 'partner' WHERE partner_type = 'user'`);
    console.log('Updated partner_type values');

    // Add new constraint
    await client.query(`ALTER TABLE partners ADD CONSTRAINT partners_partner_type_check CHECK (partner_type IN ('admin', 'partner'))`);
    console.log('Added new constraint');

    // Update index name
    await client.query('DROP INDEX IF EXISTS idx_users_userid');
    await client.query('CREATE INDEX IF NOT EXISTS idx_partners_userid ON partners(userid)');
    console.log('Updated index');

    console.log('Migration completed successfully!');

  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  } finally {
    client.release();
  }
}

migrateToPartners()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
