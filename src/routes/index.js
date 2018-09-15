const express = require("express");
const router = express.Router();

// Instagram API
const Instagram = require("node-instagram").default;
const { clientId, clientSecret } = require("../keys").instagram;

const instagram = new Instagram({
  clientId: clientId,
  clientSecret: clientSecret
});
const redirectUri = "http://localhost:3000/handleauth";

// First redirect user to instagram oauth
router.get("/auth/instagram", (req, res) => {
  res.redirect(
    instagram.getAuthorizationUrl(redirectUri, {
      // an array of scopes
      scope: ["basic", "likes"],
      // an optional state
      state: "your state"
    })
  );
});

// Handle auth code and get access_token for user
router.get("/handleauth", async (req, res) => {
  try {
    // The code from the request, here req.query.code for express
    const code = req.query.code;
    const data = await instagram.authorizeUser(code, redirectUri);
    // data.access_token contain the user access_token
    // res.json(data);
    // console.log(data);
    // Store login data in a session
    req.session.access_token = data.access_token;
    req.session.user_id = data.user.id;

    instagram.config.accessToken = req.session.access_token;
    console.log(instagram);
    res.redirect("/profile");
  } catch (err) {
    res.json(err);
  }
});

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/profile", async (req, res) => {
  try {
    const profileData = await instagram.get("users/self");
    const media = await instagram.get('users/self/media/recent');
    console.log(profileData);
    res.render("profile", { user: profileData.data, posts: media.data});
  } catch (err) {
    console.log(err);
  }
});

router.get("/login", (req, res) => {
  res.redirect("/auth/instagram");
});

router.get("/logout", (req, res) => {
  delete req.session.access_token;
  delete req.session.user_id;
  res.redirect("/");
});

module.exports = router;
