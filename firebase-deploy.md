# Firebase Deployment Guide

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`

## Setup
1. Update `.firebaserc` with your Firebase project ID
2. Run `firebase init hosting` if you need to reconfigure

## Deploy
1. Build the project: `npm run build`
2. Deploy: `firebase deploy`

## Environment Variables
If you're using environment variables, make sure to:
1. Add them to your build process
2. Configure them in your CI/CD pipeline
3. Never commit sensitive keys to version control

## Notes
- The app uses Supabase for backend services
- Make sure your Supabase project allows your Firebase domain in the allowed origins
- Update CORS settings in Supabase if needed