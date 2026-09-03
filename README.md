STORE RATING APP

This is a full-stack Store Rating application developed as part of the Roxiler Systems FullStack Intern Coding Challenge.

The application allows users to browse stores, check their ratings and submit their own ratings from 1 to 5 stars. Different features are available depending on the user's role.

There are three types of users in the application:

• System Administrator
• Normal User
• Store Owner


ABOUT THE APPLICATION

The main purpose of this project is to provide a simple platform where users can rate stores and store owners can view the feedback received for their stores.

The administrator manages the users and stores through the admin dashboard.

Normal users can search for stores, view their overall ratings and submit or modify their own ratings.

Store owners can see the average rating of their store and the ratings submitted by customers.


FEATURES

ADMINISTRATOR

• Admin login
• Dashboard showing total users, stores and ratings
• Add new users
• Add new stores
• View all registered users
• Filter users by name, email, address and role
• View user details
• View all stores
• Filter and sort stores
• View all submitted ratings
• Logout


NORMAL USER

• User registration
• User login
• View all stores
• Search stores by name or address
• View overall store ratings
• Submit ratings from 1 to 5
• Modify previously submitted ratings
• Update password
• Logout


STORE OWNER

• Store owner login
• View assigned store
• View average store rating
• View total number of ratings
• View customers who submitted ratings
• View individual customer ratings
• Update password
• Logout


TECHNOLOGIES USED

Frontend:
React.js, JavaScript, HTML and CSS

Backend:
Node.js, Express.js, JWT Authentication, bcrypt.js and CORS

Database:
MySQL


PROJECT STRUCTURE

store-rating-app/
│
├── backend/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md


VALIDATION

The application includes validation for the required fields.

• Name should be between 20 and 60 characters
• Address can contain a maximum of 400 characters
• Password should be between 8 and 16 characters
• Password must contain at least one uppercase letter
• Password must contain at least one special character
• Email must be in a valid format
• Ratings can only be between 1 and 5


DATABASE

The application uses MySQL for storing and managing the application data.

The main tables are:

• Users
• Stores
• Ratings

The ratings table connects users with stores and is used to calculate the overall rating of each store.


AUTHENTICATION

JWT authentication is used to manage user login sessions and role-based access.

Passwords are protected using bcrypt.js.

Based on the logged-in user's role, the application displays the appropriate dashboard and features.


HOW TO RUN THE PROJECT

First, clone the repository:

git clone https://github.com/SHRUTI3205/store-rating-app.git

Then move into the project folder:

cd store-rating-app


BACKEND

Go to the backend folder:

cd backend

Install the required packages:

npm install

Start the backend:

node server.js

The backend will run on:

http://localhost:5000


FRONTEND

Open another terminal and go to the frontend folder:

cd frontend

Install the required packages:

npm install

Start the React application:

npm start

The frontend will run on:

http://localhost:3000


GITHUB REPOSITORY

https://github.com/SHRUTI3205/store-rating-app


PROJECT STATUS

The Store Rating application has been completed as a full-stack project using React.js, Node.js, Express.js and MySQL.

The required user roles, authentication, store management, user management and rating functionality have been implemented.


AUTHOR

Shruti Sharma

Developed as part of the Roxiler Systems FullStack Intern Coding Challenge.
