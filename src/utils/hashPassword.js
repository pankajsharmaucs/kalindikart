const bcrypt = require('bcryptjs');

async function generateHash(plainPassword) {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(plainPassword, saltRounds);
    console.log('------------------------------');
    console.log('Plain Password:', plainPassword);
    console.log('Bcrypt Hash:', hashed);
    console.log('------------------------------');
    return hashed;
}

// Usage: Change '12345' to whatever password you want
generateHash('12345');