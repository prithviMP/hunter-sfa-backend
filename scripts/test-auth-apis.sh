#!/bin/bash

# Test Authentication APIs with curl commands
# This script tests the login, signup, refresh token, logout, and profile APIs

# Set the base URL
BASE_URL="http://localhost:7777/api/v1/auth"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing Authentication APIs${NC}"
echo "=================================="

# Test Login API with Admin user
echo -e "\n${BLUE}Testing Login API with Admin user${NC}"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.admin@example.com",
    "password": "Admin123!"
  }')

echo "Response: $ADMIN_RESPONSE"

# Extract the access token from the response
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}Admin login successful!${NC}"
  echo "Access Token: ${ADMIN_TOKEN:0:20}..."
else
  echo -e "${RED}Admin login failed!${NC}"
fi

# Test Login API with Manager user
echo -e "\n${BLUE}Testing Login API with Manager user${NC}"
MANAGER_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mike.manager@example.com",
    "password": "Manager123!"
  }')

echo "Response: $MANAGER_RESPONSE"

# Extract the access token from the response
MANAGER_TOKEN=$(echo $MANAGER_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -n "$MANAGER_TOKEN" ]; then
  echo -e "${GREEN}Manager login successful!${NC}"
  echo "Access Token: ${MANAGER_TOKEN:0:20}..."
else
  echo -e "${RED}Manager login failed!${NC}"
fi

# Test Login API with Sales Rep user
echo -e "\n${BLUE}Testing Login API with Sales Rep user${NC}"
SALES_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sam.sales@example.com",
    "password": "Sales123!"
  }')

echo "Response: $SALES_RESPONSE"

# Extract the access token from the response
SALES_TOKEN=$(echo $SALES_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -n "$SALES_TOKEN" ]; then
  echo -e "${GREEN}Sales Rep login successful!${NC}"
  echo "Access Token: ${SALES_TOKEN:0:20}..."
else
  echo -e "${RED}Sales Rep login failed!${NC}"
fi

# Test Profile API with Admin token
echo -e "\n${BLUE}Testing Profile API with Admin token${NC}"
if [ -n "$ADMIN_TOKEN" ]; then
  PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/profile \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  echo "Response: $PROFILE_RESPONSE"
else
  echo -e "${RED}Skipping profile test - no admin token available${NC}"
fi

# Test Signup API for a new user
echo -e "\n${BLUE}Testing Signup API for a new user${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "New",
    "lastName": "User",
    "email": "new.user@example.com",
    "username": "newuser",
    "password": "NewUser123!",
    "phoneNumber": "9876543210"
  }')

echo "Response: $SIGNUP_RESPONSE"

# Test Login with the newly created user
echo -e "\n${BLUE}Testing Login with newly created user${NC}"
NEW_USER_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.user@example.com",
    "password": "NewUser123!"
  }')

echo "Response: $NEW_USER_RESPONSE"

# Extract the access token from the response
NEW_USER_TOKEN=$(echo $NEW_USER_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -n "$NEW_USER_TOKEN" ]; then
  echo -e "${GREEN}New user login successful!${NC}"
  echo "Access Token: ${NEW_USER_TOKEN:0:20}..."
else
  echo -e "${RED}New user login failed!${NC}"
fi

echo -e "\n${BLUE}Authentication API Tests Completed${NC}"
echo "==================================" 