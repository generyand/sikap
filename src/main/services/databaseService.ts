// Add this to your database initialization logic
async function initializeDatabase() {
  try {
    // Check if profiles table exists
    const tableExists = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='profiles';"
    );
    
    if (!tableExists[0].length) {
      // Create profiles table
      await sequelize.query(`
        CREATE TABLE profiles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          avatar TEXT,
          theme TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Created profiles table");
    }
    
    // You should also add similar checks and creation logic for other tables
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

// Add this function to test the database
async function testDatabaseWithSampleProfile() {
  try {
    const dbService = DatabaseService.getInstance();
    
    // Check if any profiles exist
    const profileCount = await dbService.profile.count();
    console.log(`Database has ${profileCount} profiles`);
    
    // If no profiles exist, create a test profile
    if (profileCount === 0) {
      const testProfile = await dbService.profile.create({
        name: 'Test User',
        avatar: null,
        theme: 'light'
      });
      console.log('Created test profile:', testProfile.id);
    }
    
    return true;
  } catch (error) {
    console.error('Test profile creation failed:', error);
    return false;
  }
} 