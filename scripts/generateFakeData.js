const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

// Function to generate one row of fake data
const generateFakeRow = () => {
  return {
    firstName: faker.person.firstName(),
    middleName: faker.person.middleName(),
    lastName: faker.person.lastName(),
    emailId: faker.internet.email(),
    contact: faker.phone.number(),
    address: faker.location.streetAddress(true),
    securityNumber: faker.string.numeric(9) // 9-digit SSN-like number
  };
};

// Function to generate CSV content
const generateCSV = (numRows) => {
  const headers = ['First Name', 'Mid name', 'Last Name', 'Personal Email', 'contacts', 'Addresses', 'SSN'];
  const rows = [headers.join(',')];


  for (let i = 0; i < numRows; i++) {
    const row = generateFakeRow();
    rows.push(
      [
        row.firstName,
        row.middleName,
        row.lastName,
        row.emailId.toLowerCase(),
        row.contact,
        `"${row.address}"`, // Wrapping address in quotes to handle commas
        row.securityNumber
      ].join(',')
    );

    // Log progress every 1000 rows
    if (i % 1000 === 0) {
      console.log(`Generated ${i} rows...`);
    }
  }

  return rows.join('\n');
};

// Generate and save the CSV file
const outputPath = path.join(__dirname, '..', 'data', 'fake_users.csv');

// Create data directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'data'));
}

// Generate 15000 rows of data
console.log('Starting data generation...');
const csvContent = generateCSV(2500);

// Write to file
fs.writeFileSync(outputPath, csvContent, 'utf-8');
console.log(`Data generation complete! File saved to: ${outputPath}`);
