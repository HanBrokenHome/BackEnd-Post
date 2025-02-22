import mongoose, { mongo } from "mongoose";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
const app = express();
app.use(express.json());
app.use(cors())
mongoose.connect("mongodb://localhost:27017/Challenge")
const AkunSchema = mongoose.Schema({
    username : {
        type :String,
        unique : true,
        required : true
    },
    email : {
        type : String,
        unique : true,
        required : true
    },
    post : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    }
})

const Akun = mongoose.model("akun", AkunSchema)
const PostSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    content : {
        type : String,
        required : false
    },
    author : [{type : mongoose.Types.ObjectId, ref : "akun"}]
});

const Post = mongoose.model("post", PostSchema);

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "akun", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "post", required: true },
    content: { type: String, required: true }
});

const CommentModel = mongoose.model("comment", CommentSchema);

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Akses Ditolak!" });
  
    try {
      const verified = jwt.verify(token, "sigma");
      req.user = verified;
      next();
    } catch (err) {
      res.status(400).json({ message: "Token tidak valid!" });
    }
  };

// Akun
app.post("/register", async (req, res) => {
    try {
        const { email, username, post, password } = req.body;
        const akun = await Akun.findOne({ email });
        if (akun) {
            return res.status(422).json({
                message: "Email sudah digunakan"
            }); // ✅ Pakai return agar kode berhenti di sini
        }
        const enkripsi = await bcrypt.hash(password, 10);
        const newAccount = new Akun({
            email,
            username,
            post,
            password: enkripsi
        });

        await newAccount.save();
        res.status(200).json({
            message: "Berhasil membuat akun",
        });
    } catch (error) {
        res.status(500).json({
            message: `Error on register because: ${error}`
        });
    }
});



app.post("/Login", async(req,res) => {
    try{
        const {email, password} = req.body;
        const akun = await Akun.findOne({email});
        if(!akun) res.status(422).json({message : "akun tidak di temukan"})
        if(!(await bcrypt.compare(password, akun.password))) res.status(422).json({message : "password salah!"});
        const token = jwt.sign(
            {id : akun._id},
            "sigma",
            {expiresIn : '1d'}
        )
        res.status(200).json({
            message : "Berhasil Login",
            token,
        })
    }
    catch(error){
        res.status(500).json({
            message : `Error on login because : ${error}`
        })
    }
});

app.get("/post", async(req, res) => {
    try{
        const jumlah = await Post.find().populate("author")
        res.status(200).json({jumlah})
    }
    catch(error){
        res.status(500).json({
            message : `error on get result because ${error}`
        })
    }
})

app.post("/addPost", authMiddleware, async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const newPost = new Post({ title, content, author });
        await newPost.save();
        res.status(201).json({ message: "Post berhasil ditambahkan!" });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error}` });
    }
});

app.get("/user", async(req,res) => {
    try{
        const data = await Akun.find({});
        res.status(200).json(data)
    }  
    catch(error){
        res.status(500).json({
            message : `Error on get user because ${error}`
        })
    }
})

app.post("/addComment", authMiddleware, async(req,res) => {
    try{
        const { postId, content} = req.body;
        const userId = req.body.userId
        const newComment = new CommentModel({userId, postId, content});
        await newComment.save();
        res.status(200).json({
            message : "Komentar berhasil di post"
        })
    }
    catch(error){
        res.status(500).json({
            message : `error on post comment because ${error}`
        })
    }
});

app.get("/comment/:post", async (req, res) => {
    try {
        const comments = await CommentModel.find({ postId: req.params.post })
            .populate("userId", "username"); // Pastikan populate username
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({
            message: `Error on get comment because: ${error}`
        });
    }
});

app.get("/comments", async(req, res) => {
    try {
        const jumlah = await Post.find().populate("author", "username");
        const formattedPosts = jumlah.map(post => ({
            _id: post._id,
            title: post.title,
            content: post.content,
            author: post.author.map(a => a.username) // Ambil hanya username
        }));
        res.status(200).json(formattedPosts);
    } catch (error) {
        res.status(500).json({
            message: `Error on get result because ${error}`
        });
    }
})

// Hapus komentar berdasarkan ID
app.delete("/comment/delete/:id", authMiddleware, async (req, res) => {
    try {
      const commentId = req.params.id;
      const deletedComment = await CommentModel.findByIdAndDelete(commentId);
  
      if (!deletedComment) {
        return res.status(404).json({ message: "Komentar tidak ditemukan!" });
      }
      res.status(200).json({ message: "Komentar berhasil dihapus!" });
    } catch (error) {
      res.status(500).json({
        message: `Error on delete comment: ${error}`,
      });
    }
  });
  
app.listen(5001, () => console.log(`server berjalan di port`))