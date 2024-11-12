#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Function to get the version installed in node_modules
function getInstalledVersion(packageName) {
  const packagePath = path.join('node_modules', packageName, 'package.json');
  try {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageData.version;
  } catch (error) {
    console.error(`Error getting version for package ${packageName}:`, error);
    return null;
  }
}

// Function to get the release date of a specific package version
function getReleaseDate(packageName, version) {
  const url = `https://registry.npmjs.org/${packageName}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const packageData = JSON.parse(data);
          if (packageData.time && packageData.time[version]) {
            resolve(new Date(packageData.time[version]));
          } else {
            resolve(null); // Release date not found
          }
        } catch (error) {
          console.error(`Error parsing JSON for ${packageName}@${version}:`, error);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error(`Failed to get data for ${packageName}@${version}:`, error);
      resolve(null);
    });
  });
}

// Function to calculate the difference in days between dates
function getDaysDifference(date) {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Main function to print release dates of all dependencies
async function printReleaseDates() {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  for (const [packageName] of Object.entries(dependencies)) {
    const installedVersion = getInstalledVersion(packageName); // Get the actual installed version

    if (installedVersion) {
      const releaseDate = await getReleaseDate(packageName, installedVersion);

      if (releaseDate) {
        const daysAgo = getDaysDifference(releaseDate);
        console.log(
          `${packageName}@${installedVersion} was released ${daysAgo} days ago (${releaseDate.toLocaleDateString()})`,
        );
      } else {
        console.error(`Failed to get release date for ${packageName}@${installedVersion}`);
      }
    } else {
      console.error(`Failed to get installed version for ${packageName}`);
    }
  }
}

printReleaseDates();
