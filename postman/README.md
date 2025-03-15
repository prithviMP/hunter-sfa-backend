# Hunter SFA API Testing

This directory contains tools for testing the Hunter SFA APIs, particularly the authentication endpoints.

## Postman Collection

The `Hunter-SFA-Auth-APIs.postman_collection.json` file contains a Postman collection that you can import into Postman to test the authentication APIs.

### How to Import the Collection

1. Open Postman
2. Click on "Import" in the top left corner
3. Select "File" and choose the `Hunter-SFA-Auth-APIs.postman_collection.json` file
4. Click "Import"

### Using the Collection

The collection includes the following requests:

#### Authentication
- **Login - Admin User**: Login with admin user credentials
- **Login - Manager User**: Login with manager user credentials
- **Login - Sales Rep User**: Login with sales rep user credentials
- **Login - Username**: Login with username instead of email
- **Signup - New User**: Register a new user
- **Get Profile**: Get the current user's profile (requires authentication)
- **Refresh Token**: Refresh the access token using the refresh token cookie
- **Logout**: Logout the current user (requires authentication)

#### Users
- **Get All Users**: Get all users (requires admin privileges)

#### Health Check
- **Health Check**: Check if the API is running

### Automatic Token Handling

The collection includes a test script that automatically saves the access token from login responses to an environment variable called `accessToken`. This variable is then used in subsequent requests that require authentication.

To use this feature:
1. Create a new environment in Postman
2. Add a variable called `accessToken` with an empty initial value
3. Select this environment when using the collection

## Shell Script

The `test-auth-apis.sh` script in the `scripts` directory can be used to test the authentication APIs from the command line.

### How to Run the Script

1. Make sure the script is executable:
   ```
   chmod +x scripts/test-auth-apis.sh
   ```

2. Run the script:
   ```
   ./scripts/test-auth-apis.sh
   ```

The script will:
1. Test login with admin, manager, and sales rep users
2. Test the profile API with the admin token
3. Test signup for a new user
4. Test login with the newly created user

## Available Users

The following users are available for testing:

### Admin Users
- Email: john.admin@example.com
- Password: Admin123!
- Username: johnadmin

- Email: jane.admin@example.com
- Password: Admin123!
- Username: janeadmin

### Manager Users
- Email: mike.manager@example.com
- Password: Manager123!
- Username: mikemanager

- Email: mary.manager@example.com
- Password: Manager123!
- Username: marymanager

### Sales Representative Users
- Email: sam.sales@example.com
- Password: Sales123!
- Username: samsales

- Email: sarah.sales@example.com
- Password: Sales123!
- Username: sarahsales

- Email: steve.sales@example.com
- Password: Sales123!
- Username: stevesales 