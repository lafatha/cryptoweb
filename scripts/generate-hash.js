const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Admin Password Hash Generator\n');

rl.question('Enter the password you want to hash: ', (password) => {
  if (!password) {
    console.log('❌ Password cannot be empty');
    rl.close();
    return;
  }

  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  
  console.log('\n✅ Password hash generated successfully!');
  console.log('📋 Copy this hash to your SQL insert statement:');
  console.log(`'${hash}'`);
  console.log('\n📝 Complete SQL command:');
  console.log(`INSERT INTO public.admin_users (username, password_hash) VALUES ('your_username', '${hash}');`);
  
  rl.close();
});
