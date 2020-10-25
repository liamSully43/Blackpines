# Blackpines

## Purpose
This is a backup copy of the code for the Blackpines project (https://blackpines.co.uk), the purpose of this project is to streamline social media management by allowing users to post on multiple different social medial platforms from a single place by utilising the APIs provided by Twitter, LinkedIn & Facebook. This project also was a good excuse to make a MEAN stack application.

## Features & Functionality
 - User's can signup & login to Blackpines
 - User's can connect to their Twitter accounts
 - User's can view the twitter home timelines
 - User's can view their own tweets
 - User's can make tweets from Blackpines

## Known Issues
 - Facebook API doesn't pass through a API token secret - if this isn't needed for API requests to facebook then it won't be a problem
 - When twitter isn't connected to a blackpines account - the new-post page throws errors in the browser console & shows the linkedin & facebook post previews regardless if they are connected or not - this will be fixed when I get to the new-post page in regards to completing the project
 - Unable to search for users on linkedin, the issue is relating to the oauth 2.0 scope permissions set by linkedin, I'll need to add the search scope to the linkedin app/account in order to make any searccg requests - currently in contact with LinkedIn support to get this sorted.

## Notes
Currently working on the search page - added the ability to search for twitter accounts & posts
Can now authenticate/connect blackpines accounts with facebook & linkedin accounts
