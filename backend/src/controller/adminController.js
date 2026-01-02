import bcrypt from "bcrypt";
import axios from "axios";
import supabase from "../config/supabase.js";

// Add client ( start 0auth flow )

const addClients = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: client, error } = await supabase
      .from("clients")
      .insert([{ name, email, password: hashedPassword }])
      .select("id")
      .single();

    if (error) throw error;

    //  console.log("ZOHO_CLIENT_ID:", process.env.ZOHO_CLIENT_ID);

    const authUrl = `https://accounts.zoho.in/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${process.env.ZOHO_REDIRECT_URI}&prompt=consent&state=${client.id}`;
    res.status(200).json({ message: "Client created", authUrl });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Fail to add client" });
  }
};

// Get all clients

const getClients = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email, org_id, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ clients: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

// Delete clients

const deleteClients = async (req, res) => {
  try {
    const { client_id } = req.params;
    
    if (!client_id) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const { data, error } = await supabase
      .from("clients")
      .delete()
      .eq("id", client_id)
      .select("id");

    if (error) throw error;

    if (!data?.length) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete client" });
    console.log(error);
  }
};

// OAUTH CALLBACK

const OauthToken = async (req, res) => {
  try {
    const { code, state, error } = req.query; // state = client_id

    // If user rejected consent
    if (error === "access_denied") {
      console.log("OAuth rejected by user");

      // Delete the client created earlier
      await supabase.from("clients").delete().eq("id", state);

      return res.redirect(
        `${process.env.APP_BASE_URL}/admin/clients?success=false&reason=oauth_rejected`
      );
    }

    if (!code || !state) {
      return res.redirect(
        `${process.env.APP_BASE_URL}/admin/clients?success=false&reason=invalid_callback`
      );
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      redirect_uri: process.env.ZOHO_REDIRECT_URI,
      code,
    });

    const { data } = await axios.post(
      "https://accounts.zoho.in/oauth/v2/token",
      body,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = data;
    const { data: orgs } = await axios.get(
      "https://books.zoho.in/api/v3/organizations",
      {
        headers: { Authorization: `Zoho-oauthtoken ${access_token}` },
      }
    );

    const org_id = orgs.organizations[0]?.organization_id;

    await supabase
      .from("clients")
      .update({
        access_token,
        refresh_token,
        org_id,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      })
      .eq("id", state)
      .select("id");

    res.redirect(`${process.env.APP_BASE_URL}/admin/clients?success=true`);
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth failed");
  }
};

export { addClients, getClients, deleteClients, OauthToken };
