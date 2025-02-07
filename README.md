# Backend-for-PropertyProject
This repository contains the backend code for Property market project, a Node.js application that powers the backend functionality of the project. It provides the necessary APIs and server-side logic to support the frontend and other components of the project.

## Setup
To run this project do:
1- Create .env file in the project folder and put these variables and make sure to fill them correctly
```shell
JWT_SECRET=
#mongoDB URL
DBURL=
#Authantication info for mailing service
EMAIL=
PASSWORD=
```
2- run this command to install necessary packages
```shell
npm install 
```
3- you can now run the project by running this command :
```shell
nodemon app
```

## Routes
### Authantication Route
Defined as /auth and containes:
/signup {Post} | /login {Post} | /requestResetCode {Post} | /reset-password {Post}

### Notification Inbox Route
Defined as /inbox and contains:
/view {Get} | /approve-property/:propertyId {Post} | /deny-property/:propertyId {Post} | /accept-promotionToAdmin/:propertyId {Post} |
/reject-promotionToAdmin/:propertyId {Post}

### Property Route 
Defined as /property and contains:
/all {Get} | /view/:propertyId {Get} | /new-property {Post} | /edit/:propertyId {Put} | /delete/:propertyId {Delete} |
/myProperties {Get} | /:propertyId/add-comment {Post} | /:propertyId/comments {Get}

### Profile Route
Defined as /profile and contains:
/:userId {Get} | /request-promotionToAdmin {Post} 
