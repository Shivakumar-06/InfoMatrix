import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import supabase from "../config/supabase.js";

// Admin login

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    )
      return res.status(401).json({ message: "Invalid credentials" });

    const user = {
      role: "admin",
    };

    const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token, user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: clients } = await supabase
  .from("clients")
  .select("id, name, email, password")
  .eq("email", email)
  .single();


    const client = clients?.[0];

    if (!client) {
      return res.status(401).json({ message: "Client not found" });
    }

    const valid = await bcrypt.compare(password, client.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Build the final normalized user object

    const user = {
      id: client.id,
      name: client.name,
      email: client.email,
      role: "client",
    };

    const token = jwt.sign(
      {
        role: "client",
        email,
        client_id: client.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token, user });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export { adminLogin, clientLogin };
