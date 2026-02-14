const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔐 Tes clés Netikash
const CLIENT_ID = "METTRE_CLIENT_ID";
const CLIENT_SECRET = "METTRE_SECRET";

// 🔑 Token Netikash
async function getToken() {
  const res = await axios.post(
    "https://accounts.netikash.com/oauth2/token",
    { grant_type: "client_credentials" },
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        "Content-Type": "application/json",
      },
    }
  );
  return res.data.access_token;
}

// 🌍 Page d’accueil
app.get("/", (req, res) => {
  res.send(`
  <h1>DFR S.O.H ❤️ Soutien aux orphelins</h1>
  <p>Merci de votre générosité !</p>
  <form action="/payer" method="POST">
    <input type="number" name="amount" placeholder="Montant du don" required>
    <button type="submit">Faire un don</button>
  </form>
  `);
});

// 💳 Paiement
app.post("/payer", async (req, res) => {
  const token = await getToken();
  const amount = req.body.amount;

  try {
    const payment = await axios.post(
      "https://api.netikash.com/api/v1/transactions/requests/cli-payments",
      {
        amount: amount,
        currency: "USD",
        ref: "DON-" + Date.now(),
        referer_url: "https://ton-site.com/merci", // Remplacer après
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.redirect(payment.data.link);
  } catch (e) {
    res.send("Erreur lors de la création du paiement : " + e.message);
  }
});

// ❤️ Page Merci
app.get("/merci", (req, res) => {
  res.send("<h2>Merci pour votre don ❤️</h2>");
});

app.listen(3000, () => console.log("Serveur lancé sur port 3000"));