[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Btj42XrM)
# NodeJS - Midterm Project

**Goal:** Create a site with BREAD (Browse, Read, Edit, Add, Delete) functionality using Node.js and Express as backend and a frontend of your choice. A user must be able to register, login, display, add, edit, and delete items.

## Instructions 📖

- You are free to create any type of site as long as it has CRUD/BREAD functionality and using MVC pattern.
- Keep the database in-memory or inside a model (No external database).
- The site must have login and signup.
- Use TypeScript.
- Use `bcrypt` package to hash and verify the password [https://www.npmjs.com/package/bcrypt].
- Use `zxcvbn` or something similar to check for password strength.
- Use `uuid` package to generate unique ids.
- Use cookie session to keep user information in the browser after they login (do not store passwords!). Clear the cookies when they log out.
- Create middleware so that BREAD routes are only accessible if the user is authenticated or logged in.
- You can choose to build your frontend/view using Astro, EJS (not preferable), or another library such as React if you prefer.
- Design your web application in Figma.

### Example Routes and Requests

- **Browse:** `GET /posts`
- **Read:** `GET /posts/1`
- **Search:** `GET /posts/search?q=keyword`
- **Edit:** `PUT /posts/1`
- **Add:** `POST /posts`
- **Delete:** `DELETE /posts/1`
---
- **Register** `POST /users/register`
- **Login** `POST /users/login`

## Sample Ideas 💡

- Online Store
- Blog
- To-Do App
- Employee Management System
- Music Player
- Movies App
- Recipe App
- Diary App

## Presentation 📽️

Individual presentation will be on next Monday. During the presentation of your website, please follow this flow:

1. Show your Figma mockup design
2. Signup
3. Login
4. Add an item
5. Show all items in a list
6. View individual item (by clicking a button or link)
7. Search item by keyword
8. Edit item
9. Delete item
10. Log out

Good luck! 🎉🎉🎉
