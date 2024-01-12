// PROCESS controller
function processController() {
  const fs = require('fs');

  const accountsPath = './accounts/';

  function createAccount(username, password) {
    const accountData = {
      username,
      password,
      addresses: [],
      pickUp: {}
    };

    fs.writeFileSync(`${accountsPath}${username}.json`, JSON.stringify(accountData));

    console.log('Account created successfully!');
    mainMenu();
  }

  function login(username, password) {
    const filePath = `${accountsPath}${username}.json`;

    if (fs.existsSync(filePath)) {
      const accountData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (accountData.password === password) {
        console.log('Login successful!');
        accountMenu(username); // Enter the account menu
      } else {
        console.log('Invalid password. Please try again.');
        mainMenu();
      }
    } else {
      console.log('Account not found. Please create an account.');
      mainMenu();
    }
  }

  function showOrderDetails(username) {
    const filePath = `${accountsPath}${username}.json`;
    const accountData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const { addresses, pickUp } = accountData;

    if (!addresses || addresses.length === 0 || !pickUp.date || !pickUp.time) {
      console.log('No order details available.');
    } else {
      console.log('Confirmed Order Details:');
      console.log('Address:', addresses[addresses.length - 1]);
      console.log('Pick-Up Date:', pickUp.date);
      console.log('Pick-Up Time:', pickUp.time);
    }

    accountMenu(username);
  }

  function accessAccount(username) {
    // Removed this function as it was not being used
  }

  function inputAddress(username) {
    const filePath = `${accountsPath}${username}.json`;
    const accountData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    uiCtrl.promptUserInput('Enter your address: ', (address) => {
      accountData.addresses.push(address);
      fs.writeFileSync(filePath, JSON.stringify(accountData));

      console.log('Address added successfully!');
      accountMenu(username);
    });
  }

  function orderPickUp(username) {
    const filePath = `${accountsPath}${username}.json`;
    const accountData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    uiCtrl.promptUserInput('Enter pick-up date (dd/mm/yyyy): ', (date) => {
      uiCtrl.promptUserInput('Enter pick-up time (24-hour format): ', (time) => {
        accountData.pickUp = { date, time };
        fs.writeFileSync(filePath, JSON.stringify(accountData));

        console.log('Pick-up ordered successfully!');
        accountMenu(username);
      });
    });
  }

  return {
    createAccount,
    login,
    accessAccount,
    showOrderDetails,
    inputAddress,
    orderPickUp
  };
}

// UI controller
function uiController() {
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function promptUserInput(prompt, callback) {
    rl.question(prompt, (input) => {
      callback(input);
    });
  }

  return {
    promptUserInput
  };
}

// GLOBAL APP controller 
const processCtrl = processController();
const uiCtrl = uiController();

const fs = require('fs');

// Check if the accounts directory exists, create it if not
if (!fs.existsSync('./accounts/')) {
  fs.mkdirSync('./accounts/');
}

function mainMenu() {
  console.log('\n=== Main Menu ===');
  console.log('1. Create Account');
  console.log('2. Login');
  console.log('3. Exit');

  uiCtrl.promptUserInput('Select an option (1-3): ', (choice) => {
    switch (choice) {
      case '1':
        uiCtrl.promptUserInput('Enter your username: ', (username) => {
          uiCtrl.promptUserInput('Enter your password: ', (password) => {
            processCtrl.createAccount(username, password);
          });
        });
        break;
      case '2':
        uiCtrl.promptUserInput('Enter your username: ', (username) => {
          uiCtrl.promptUserInput('Enter your password: ', (password) => {
            processCtrl.login(username, password);
          });
        });
        break;
      case '3':
        rl.close();
        break;
      default:
        console.log('Invalid option. Please try again.');
        mainMenu();
    }
  });
}

function accountMenu(username) {
  console.log('\n=== Account Menu ===');
  console.log('1. Confirm your Address');
  console.log('2. Order Pick-Up');
  console.log('3. Show Order Details');
  console.log('4. Exit Account');

  uiCtrl.promptUserInput('Select an option (1-4): ', (choice) => {
    switch (choice) {
      case '1':
        processCtrl.inputAddress(username);
        break;
      case '2':
        processCtrl.orderPickUp(username);
        break;
      case '3':
        processCtrl.showOrderDetails(username);
        break;
      case '4':
        mainMenu();
        break;
      default:
        console.log('Invalid option. Please try again.');
        accountMenu(username);
    }
  });
}

// Start the app
mainMenu();

