# OTP Email Verification Setup Guide

## Overview
The application now includes OTP (One-Time Password) email verification during user registration. Users must verify their email with an OTP before they can log in.

## Installation
The following packages have been installed:
- `otp-generator` - For generating 6-digit OTPs
- `nodemailer` - For sending OTP emails

## Configuration

### 1. Update Environment Variables
Edit your `.env` file in the backend directory and add your email credentials:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 2. Gmail Setup (Recommended)
If using Gmail SMTP:

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to myaccount.google.com
   - Select "Security" from the left menu
   - Enable "2-Step Verification" if not already enabled
   - Go to "App passwords"
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Use this password as `EMAIL_PASSWORD` in your `.env` file

3. Your `EMAIL_USER` should be your full Gmail address: `your.email@gmail.com`

### 3. Alternative Email Services
You can use other email services like:
- SendGrid
- Mailgun
- AWS SES
- Office 365
- Yahoo Mail

Just update the `emailConfig.js` file with the appropriate SMTP settings.

## API Endpoints

### 1. Register User
**POST** `/api/users/register`

Request:
```json
{
  "firstName": "David",
  "lastName": "Ndayiringiye",
  "email": "your_email@example.com",
  "password": "your_password",
  "phone": "0788123456",
  "role": "tenant",
  "nationalId": "1234567890123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for OTP verification code.",
  "data": {
    "id": 1,
    "firstName": "David",
    "lastName": "Ndayiringiye",
    "email": "your_email@example.com",
    "phone": "0788123456",
    "role": "tenant",
    "nationalId": "1234567890123456"
  }
}
```

### 2. Verify OTP
**POST** `/api/users/verify-otp`

Request:
```json
{
  "email": "your_email@example.com",
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
    "firstName": "David",
    "lastName": "Ndayiringiye",
    "email": "your_email@example.com",
    "phone": "0788123456",
    "role": "tenant",
    "token": "jwt_token_here",
    "message": "Email verified successfully"
  }
}
```

### 3. Login User
**POST** `/api/users/login`

Note: Users can only login after verifying their email with OTP

Request:
```json
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "firstName": "David",
    "lastName": "Ndayiringiye",
    "email": "your_email@example.com",
    "phone": "0788123456",
    "role": "tenant",
    "token": "jwt_token_here"
  }
}
```

## OTP Features

- **OTP Validity**: 10 minutes
- **OTP Format**: 6-digit numeric code
- **OTP Delivery**: Sent via email with HTML formatting
- **Security**: Users cannot login until email is verified
- **Failed Login**: Returns "Please verify your email first" if not verified

## Database Changes

New fields added to the `users` table:
- `otp` (STRING) - Stores the 6-digit OTP
- `otpExpiry` (DATE) - Timestamp when OTP expires
- `isVerified` (BOOLEAN) - Whether user's email is verified

## Testing with ThunderClient

1. **Register a new user**
   - Endpoint: `POST http://localhost:5000/api/users/register`
   - Check your email for the OTP

2. **Verify OTP**
   - Endpoint: `POST http://localhost:5000/api/users/verify-otp`
   - Email: Your registration email
   - OTP: The code from your email

3. **Login**
   - Endpoint: `POST http://localhost:5000/api/users/login`
   - Use your credentials (now that email is verified)

## Error Handling

Common error messages:
- `"OTP has expired. Please request a new one."` - OTP is older than 10 minutes
- `"Invalid OTP"` - OTP doesn't match
- `"User already verified"` - User already completed email verification
- `"Please verify your email first"` - Cannot login until email is verified

## Future Enhancements

You can add:
1. Resend OTP endpoint
2. OTP rate limiting (prevent brute force)
3. SMS-based OTP (using Twilio)
4. Remember device feature
5. Two-factor authentication (2FA)
