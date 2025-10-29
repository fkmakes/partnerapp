const pool = require('./config');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('Creating users table...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        userid VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'user')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_userid ON users(userid)
    `);

    console.log('Users table created successfully');

    // Check if users already exist
    const checkUsers = await client.query('SELECT COUNT(*) FROM users');

    if (parseInt(checkUsers.rows[0].count) === 0) {
      console.log('Seeding initial users...');

      // Hash passwords
      const adminPassword = await bcrypt.hash('admin123', 10);
      const userPassword = await bcrypt.hash('user123', 10);

      // Insert admin user
      await client.query(
        'INSERT INTO users (userid, password, user_type) VALUES ($1, $2, $3)',
        ['admin', adminPassword, 'admin']
      );

      // Insert regular user
      await client.query(
        'INSERT INTO users (userid, password, user_type) VALUES ($1, $2, $3)',
        ['user', userPassword, 'user']
      );

      console.log('Initial users created successfully');
      console.log('Admin - userid: admin, password: admin123');
      console.log('User - userid: user, password: user123');
    } else {
      console.log('Users already exist, skipping seed');
    }

  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
