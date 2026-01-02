import axios from "axios";
import supabase from "../config/supabase.js";
import dotenv from "dotenv";
dotenv.config();

export const refreshTokenIfNeeded = async (client) => {
  const expiresAt = new Date(client.token_expires_at); // This is the time whem the token expires

  // Still valid for at least 1 minute
  // If the token is still valid for at least 1 minute, return the access token

  if (Date.now() < expiresAt.getTime() - 60000) {
    return client.access_token;       
  }

  console.log("Refreshing Zoho access token...");

  const body = new URLSearchParams({
    refresh_token: client.refresh_token,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const { data } = await axios.post("https://accounts.zoho.in/oauth/v2/token", body);
  const newToken = data.access_token;
  const expiresIn = data.expires_in || 3600; // seconds || fallback to 1 hour if not provided by zoho 
  const expiresAtStr = new Date(Date.now() + expiresIn * 1000).toISOString(); // convert to ISO string 

  // Save new access token in Supabase
  
  const { error } = await supabase
    .from("clients")
    .update({
      access_token: newToken,
      token_expires_at: expiresAtStr,
    })
    .eq("id", client.id);

  if (error) console.error("Supabase update error:", error);
  
};
