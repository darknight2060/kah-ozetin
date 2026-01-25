const fs = require('fs');
const readline = require('readline');

// Path to your JSON file
const filePath = 'raw.json';

// Create a readable stream
const fileStream = fs.createReadStream(filePath);

// Create an interface to read lines
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let lineCount = 0;
const maxLines = 150; // Adjust the number of lines you want to read

rl.on('line', (line) => {
  if (lineCount < maxLines) {
    console.log(line);  // Print the first few lines
    lineCount++;
  } else {
    rl.close();  // Stop reading further lines
  }
});

rl.on('close', () => {
  console.log('Finished reading the first few lines.');
});
