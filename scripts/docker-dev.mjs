#!/usr/bin/env node

/**
 * Cross-platform Docker development script
 * Works on Windows, macOS, and Linux
 */

import fs from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse .env file
function readEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

// Execute docker command with proper error handling
function execDocker(args, ignoreError = false) {
  console.log(`Running: docker ${args.join(' ')}`);
  
  const result = spawnSync('docker', args, {
    stdio: 'inherit',
    shell: false
  });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      console.error('Error: Docker is not installed or not in PATH');
      process.exit(1);
    }
    throw result.error;
  }

  if (!ignoreError && result.status !== 0) {
    console.error(`Docker command failed with exit code ${result.status}`);
    process.exit(result.status);
  }

  return result.status === 0;
}

// Main execution
function main() {
  const envVars = readEnvFile();
  
  const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseAnonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env file');
    process.exit(1);
  }

  console.log('🐳 Starting Docker development build...\n');

  // Stop existing container (ignore errors if it doesn't exist)
  console.log('Stopping existing container...');
  execDocker(['stop', 'journal-app-dev'], true);

  // Remove existing container (ignore errors if it doesn't exist)
  console.log('Removing existing container...');
  execDocker(['rm', '-f', 'journal-app-dev'], true);

  // Build the image
  console.log('\nBuilding Docker image...');
  execDocker([
    'build',
    '--build-arg', `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
    '--build-arg', `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}`,
    '-t', 'journal-app:dev',
    '.'
  ]);

  // Run the container
  console.log('\nStarting container...');
  execDocker([
    'run',
    '--name', 'journal-app-dev',
    '-p', '3000:3000',
    '--env-file', '.env',
    'journal-app:dev'
  ]);

  console.log('\n✅ Container started successfully!');
  console.log('🌐 Application available at http://localhost:3000');
}

// Run main function
try {
  main();
} catch (error) {
  console.error('Unexpected error:', error.message);
  process.exit(1);
}
