async function createAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Admin User',
        email: 'admin@wastesmart.com',
        password: 'Admin@123',
        adminSecret: process.env.ADMIN_SECRET || 'your-admin-secret'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create admin: ${error}`);
    }

    const data = await response.json();
    console.log('Admin user created successfully!');
    console.log('Login credentials:');
    console.log('Email: admin@wastesmart.com');
    console.log('Password: Admin@123');
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin(); 