# Email OTP Verification Setup Guide

## Overview
This system implements email-based OTP (One-Time Password) verification for user registration. When users sign up, they receive a 6-digit OTP via email that must be verified to complete registration.

## Features
- 6-digit OTP generation
- Email delivery via Nodemailer
- 10-minute OTP expiration
- OTP resend functionality
- User verification status tracking

## Environment Configuration

Update your `.env` file with the following settings:

```env
# Email Configuration
EMAIL_SERVICE=gmail  # Email service provider (gmail, outlook, etc.)
EMAIL_USER=your_email@gmail.com  # Your email address
EMAIL_PASSWORD=your_app_password  # App-specific password (not your regular password)
```

### Gmail Setup Instructions

1. **Enable 2-Factor Authentication**
   - Go to myaccount.google.com
   - Select "Security" from the left menu
   - Enable "2-Step Verification"

2. **Create App Password**
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your OS)
   - Google will generate a 16-character password
   - Copy this password and use it as `EMAIL_PASSWORD` in .env

## API Endpoints

### 1. Register User
**POST** `/api/users/register`

Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "+1234567890",
  "role": "tenant",
  "nationalId": "12345678"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully. Check your email for OTP verification.",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "tenant",
    "nationalId": "12345678",
    "isVerified": false
  }
}
```

### 2. Verify OTP
**POST** `/api/users/verify-otp`

Request Body:
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "tenant",
    "isVerified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Resend OTP
**POST** `/api/users/resend-otp`

Request Body:
```json
{
  "email": "john@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP resent successfully to your email"
}
```

## Database Changes

The User table now includes two new fields:

```sql
ALTER TABLE users ADD COLUMN otp VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN otpExpiry DATETIME NULL;
```

These fields are automatically created if using Sequelize sync.

## User Registration Flow

1. User submits registration form
2. Backend validates input and creates unverified user account
3. 6-digit OTP is generated and stored with 10-minute expiration
4. OTP is sent to user's email address
5. User submits OTP for verification
6. Backend validates OTP:
   - Checks if OTP matches
   - Checks if OTP has not expired
7. If valid, user is marked as verified and receives JWT token
8. If invalid/expired, user can request a new OTP via resend endpoint

## Error Handling

### Registration Errors
- `Email already registered` - User already exists
- `Failed to send OTP email` - Email service error (user still created but not verified)

### Verification Errors
- `User not found` - Email doesn't exist in database
- `Invalid OTP` - Entered OTP doesn't match
- `OTP has expired` - OTP validity period (10 minutes) has passed

### Resend OTP Errors
- `User not found` - Email doesn't exist
- `User is already verified` - Account already verified
- `Failed to send OTP email` - Email service error

## Files Modified/Created

1. **services/emailService.js** (NEW) - Nodemailer configuration and OTP email sending
2. **model/userModel.js** - Added `otp` and `otpExpiry` fields
3. **services/userService.js** - Added `verifyOTP()` and `resendOTP()` functions
4. **controllers/userController.js** - Added `verifyOTP()` and `resendOTP()` controllers
5. **router/userRoutes.js** - Added new OTP endpoints
6. **.env** - Added email configuration variables

## Testing

### Using Postman/Thunder Client

1. **Register**
   ```
   POST http://localhost:5000/api/users/register
   ```

2. **Check Email** - User should receive OTP via email

3. **Verify OTP**
   ```
   POST http://localhost:5000/api/users/verify-otp
   Body: { "email": "user@example.com", "otp": "123456" }
   ```

4. **Get Token** - Once verified, user can use the returned token for login

## Security Considerations

- OTP is valid for only 10 minutes
- OTP is automatically cleared after successful verification
- Passwords are hashed with bcrypt
- Only verified users can access protected routes (with token)
- Each OTP resend generates a new code

## Dependencies

- `nodemailer` - Email sending
- `otp-generator` - OTP generation
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `sequelize` - ORM for database operations

All dependencies are already in `package.json`.
