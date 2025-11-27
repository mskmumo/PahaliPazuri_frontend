#!/usr/bin/env node

/**
 * Simple API Connection Test Script
 * 
 * Tests basic connectivity to the Laravel backend.
 * Run with: node scripts/test-api.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

console.log('🔍 Testing API Connection...\n');
console.log(`API URL: ${API_URL}\n`);

async function testEndpoint(endpoint, method = 'GET') {
  const url = `${API_URL}${endpoint}`;
  console.log(`Testing ${method} ${endpoint}...`);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let data;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (response.ok) {
      console.log(`✅ Success (${response.status})`);
      if (isJson && data.data) {
        console.log(`   Data items: ${Array.isArray(data.data) ? data.data.length : 'object'}`);
      }
    } else {
      console.log(`⚠️  Error (${response.status})`);
      if (data.message) {
        console.log(`   Message: ${data.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
  
  console.log('');
}

async function runTests() {
  console.log('Testing Public Endpoints:\n');
  console.log('─'.repeat(50) + '\n');
  
  // Test public endpoints
  await testEndpoint('/apartments');
  await testEndpoint('/rooms');
  await testEndpoint('/cms/pages');
  await testEndpoint('/pricing/factors');
  
  console.log('─'.repeat(50) + '\n');
  console.log('✨ API connection tests complete!\n');
  console.log('Note: Protected endpoints require authentication.');
  console.log('Use the frontend demo page to test authenticated endpoints.\n');
}

runTests().catch(console.error);
