# Blackpines

## Purpose
This is a backup copy of the code for the Blackpines project (https://blackpines.co.uk), the purpose of this project is to streamline social media management by allowing users to post on multiple different social medial platforms from a single place by utilising the APIs provided by Twitter, LinkedIn & Facebook. This project also was a good excuse to make a MEAN stack application.

## Features & Functionality
 - User's can sign up & login to Blackpines
 - User's can connect to their Twitter, LinkedIn & Facebook accounts
 - User's can view the Twitter home timelines
 - User's can view their any tweets
 - User's can view any account
 - User's can make tweets from Blackpines
 - User's can Search for tweets & Twitter accounts
 - User's can reply to tweets

## Known Issues
 - Facebook API doesn't pass through an API token secret - if this isn't needed for API requests to Facebook then it won't be a problem
 - When Twitter isn't connected to a Blackpines account - the new-post page throws errors in the browser console & shows the Linkedin & Facebook post previews regardless if they are connected or not - this will be fixed when I get to the new-post page in regards to completing the project

## Notes
 - The multi platform aspect of the app might need to be scrapped - LinkedIn does not support getting a user's feed or getting a list of user's posts. Without this the app will only be able to support posting to LinkedIn. The Facebook API is even harder to work with. Currently waiting to hear back from LinkedIn about getting additional scopes added to the Blackpines API permissions, if it's not good news then most of the multi-platform features will have to be scrapped.
