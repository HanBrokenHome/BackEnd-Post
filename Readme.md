# Express.js API

Sebuah API sederhana menggunakan Express.js dan MongoDB untuk mengelola akun, post, dan komentar.

## Instalasi

1. Clone repository ini:
   ```sh
   git clone <repository-url>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Jalankan server:
   ```sh
   npm start
   ```

## Struktur Database

### Akun (Collection: `akun`)
- `username`: String (unik, required)
- `email`: String (unik, required)
- `post`: String (required)
- `password`: String (required, hashed)

### Post (Collection: `post`)
- `title`: String (required)
- `content`: String (optional)
- `author`: ObjectId (referensi ke `akun`)

### Komentar (Collection: `comment`)
- `userId`: ObjectId (referensi ke `akun`)
- `postId`: ObjectId (referensi ke `post`)
- `content`: String (required)

## Endpoint API

### **Akun**

- **Register User**
  - `POST /register`
  - Body:
    ```json
    {
      "email": "example@email.com",
      "username": "user123",
      "post": "Some post",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    { "message": "Berhasil membuat akun" }
    ```

- **Login User**
  - `POST /login`
  - Body:
    ```json
    {
      "email": "example@email.com",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "message": "Berhasil Login",
      "token": "your_jwt_token"
    }
    ```

- **Get All Users**
  - `GET /user`
  - Response:
    ```json
    [
      {
        "_id": "userId",
        "email": "example@email.com",
        "username": "user123",
        "post": "Some post"
      }
    ]
    ```

### **Post**

- **Get All Posts**
  - `GET /post`
  - Response:
    ```json
    [
      {
        "_id": "postId",
        "title": "Post Title",
        "content": "Post content",
        "author": [{ "_id": "authorId", "username": "authorUsername" }]
      }
    ]
    ```

- **Add Post (Auth Required)**
  - `POST /addPost`
  - Headers: `{ Authorization: "Bearer <token>" }`
  - Body:
    ```json
    {
      "title": "Post Title",
      "content": "Post content",
      "author": "userId"
    }
    ```
  - Response:
    ```json
    { "message": "Post berhasil ditambahkan!" }
    ```

### **Komentar**

- **Get All Comments of a Post**
  - `GET /comment/:post`
  - Response:
    ```json
    [
      {
        "_id": "commentId",
        "userId": { "_id": "userId", "username": "user123" },
        "postId": "postId",
        "content": "Nice post!"
      }
    ]
    ```

- **Add Comment (Auth Required)**
  - `POST /addComment`
  - Headers: `{ Authorization: "Bearer <token>" }`
  - Body:
    ```json
    {
      "postId": "postId",
      "content": "Nice post!"
    }
    ```
  - Response:
    ```json
    { "message": "Komentar berhasil di post" }
    ```

- **Delete Comment (Auth Required)**
  - `DELETE /comment/delete/:id`
  - Headers: `{ Authorization: "Bearer <token>" }`
  - Response:
    ```json
    { "message": "Komentar berhasil dihapus!" }
    ```

## Teknologi yang Digunakan
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Keamanan**: JWT Authentication, bcrypt untuk hashing password

## Catatan
- Pastikan MongoDB berjalan sebelum menjalankan server.
- Token JWT diperlukan untuk endpoint yang dilindungi (ditandai dengan *Auth Required*).

---

© 2025 Express API Development

