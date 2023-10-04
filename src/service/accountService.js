const fs = require('fs');
const csv = require('csv-parser');
const sequelize = require('../utilities/sequelize');
const { accountModel } = require('../model/accountModel');
const hash = require('../utilities/hashing');
const csvFilePath = '../opt/user.csv';

const accountService = {}

accountService.readCSVAndCreateAccounts = async () => {
  try {
    await sequelize.sync();
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (row) => {
        const hashedPassword = await hash.hashPassword(row.password);
        row.password = hashedPassword;
        // console.log(row);
        await accountModel.createAccount(row);
      })
      .on('end', () => {
        console.log('Accounts created from CSV successfully.');
      });
  } catch (error) {
    // console.error('Error:', error);
    console.log("catch service");
    
    throw error;
  }
}

accountService.authenticateAccount = async (email, password) => {
  try {
    const account = await accountModel.findAccount(email);
    const isValidPassword = await hash.verifyPassword(password, account.password);
    console.log("fhghj" + isValidPassword);
    if(isValidPassword) {
      return account;
    } else {
      const err = new Error("Bad Request");
      throw err;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = accountService;