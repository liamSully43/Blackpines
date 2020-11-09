# Blackpines

## Purpose
This is a backup copy of the code for the Blackpines project (https://blackpines.co.uk), the purpose of this project is to streamline social media management by allowing users to post on multiple different social medial platforms from a single place by utilising the APIs provided by Twitter, LinkedIn & Facebook. This project also was a good excuse to make a MEAN stack application.

## Features & Functionality
 - User's can signup & login to Blackpines
 - User's can connect to their Twitter, LinkedIn & Facebook accounts
 - User's can view the Twitter home timelines
 - User's can view their own tweets
 - User's can make tweets from Blackpines
 - User's can Search for tweets & Twitter accounts
 - User's can reply to tweets

## Known Issues
 - Facebook API doesn't pass through a API token secret - if this isn't needed for API requests to facebook then it won't be a problem
 - When twitter isn't connected to a blackpines account - the new-post page throws errors in the browser console & shows the linkedin & facebook post previews regardless if they are connected or not - this will be fixed when I get to the new-post page in regards to completing the project
 - The Twitter API doesn't send back if the user has liked or retweeted a tweet, so you can't reflect the user's ineraction when first loading the tweet, i.e. the like button cannot be green regardless if the tweet has been liked by the user or not

## Notes
None
