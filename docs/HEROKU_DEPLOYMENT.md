# Heroku Deployment Guide

This guide will help you deploy the Human Story Atlas application to Heroku using the Heroku Dashboard.

## Prerequisites

1. A Heroku account
2. Your project pushed to GitHub

## Step 1: Create a new Heroku app

1. Log in to your [Heroku Dashboard](https://dashboard.heroku.com/)
2. Click the "New" button in the top right and select "Create new app"
3. Enter an app name (e.g., "human-story-atlas") and select your region
4. Click "Create app"

## Step 2: Connect to GitHub

1. Go to the "Deploy" tab in your new app's dashboard
2. In the "Deployment method" section, select "GitHub"
3. Connect your GitHub account if not already connected
4. Search for your repository (e.g., "humanstoryatlas") and click "Connect"

## Step 3: Configure environment variables

1. Go to the "Settings" tab in your app's dashboard
2. Scroll down to the "Config Vars" section and click "Reveal Config Vars"
3. Add the following environment variables:
   - `DATABASE_URL`: `file:./prisma/hsa.db`
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: `production`

## Step 4: Add buildpacks

1. Still in the "Settings" tab, scroll down to the "Buildpacks" section
2. Click "Add buildpack"
3. Select "nodejs" and save changes

## Step 5: Deploy your application

1. Go back to the "Deploy" tab
2. Scroll down to the "Manual deploy" section
3. Select the "main" branch and click "Deploy Branch"
4. Alternatively, enable "Automatic deploys" to deploy automatically when you push to GitHub

## Step 6: Monitor the deployment

1. Heroku will show the build logs
2. Once complete, click "View" to open your application

## Troubleshooting

If you encounter any issues:

1. Check the Heroku logs by going to "More" → "View logs" in your app's dashboard
2. Ensure your SQLite database file is included in the repository
3. Verify all environment variables are set correctly
4. Try rebuilding the app using the "More" → "Restart all dynos" option

## Important Notes

- The free tier of Heroku will put your app to sleep after 30 minutes of inactivity
- SQLite on Heroku is not ideal for production as it uses ephemeral storage; consider migrating to PostgreSQL for a more robust solution
- Your application will be accessible at `https://human-story-atlas.herokuapp.com` (or whatever your app name is) 