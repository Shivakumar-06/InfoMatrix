import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";


dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://infomatrix.vercel.app/login"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Routes

app.use("/api/auth", authRoutes);


// Adding lazy load for huge file routers

app.use('/api/reports', async (req,res,next)=>{
 const module = await import ('./routes/reportRoutes.js');
 return module.default(req,res,next);
})

app.use('/api/admin', async (req,res,next)=>{
 const module = await import ('./routes/adminRoutes.js');
 return module.default(req,res,next);
})

app.use('/api/dashboard', async (req,res,next)=>{
 const module = await import ('./routes/adminDashboardRoutes.js');
 return module.default(req,res,next);
})

app.use('/api/client', async (req,res,next)=>{
 const module = await import ('./routes/clientDashboardRoutes.js');
 return module.default(req,res,next);
})

app.use('/api/templates', async (req,res,next)=>{
 const module = await import ('./routes/templateRoutes.js');
 return module.default(req,res,next);
})

app.use('/api/compliance-types', async (req,res,next)=>{
 const module = await import ('./routes/complianceTypesRoutes.js');
 return module.default(req,res,next);
})

app.use('/api/compliances', async (req,res,next)=>{
 const module = await import ('./routes/complianceRoutes.js');
 return module.default(req,res,next);
})

app.use('/api/download', async (req,res,next)=>{
  const module = await import ('./routes/downloadFileRoutes.js');
  return module.default(req,res,next);
})

// to check site is work or not
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// status of site
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});



// Checking points
app.listen(port, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`✅ Server running on port ${port}`);
  }
});