const bcrypt = require('bcryptjs');

// Test password yang ada di database
const storedHash = '$2a$12$9WHXqwoM5U04zbB2QOPTDvJAGYA0H7kVe1FKv5xhtzTJhpU8B1Xo6';
const inputPassword = 'pandas';

console.log('🔍 Testing password comparison...');
console.log('Stored hash:', storedHash);
console.log('Input password:', inputPassword);

bcrypt.compare(inputPassword, storedHash).then(result => {
  console.log('Password match result:', result);
  
  if (result) {
    console.log('✅ Password is correct!');
  } else {
    console.log('❌ Password does not match');
    
    // Generate new hash for 'pandas'
    bcrypt.hash(inputPassword, 10).then(newHash => {
      console.log('\n🔧 New hash for "pandas":', newHash);
      console.log('\nSQL to update password:');
      console.log(`UPDATE admin_users SET password_hash = '${newHash}' WHERE username = 'fatha';`);
    });
  }
}).catch(err => {
  console.error('Error comparing passwords:', err);
});
