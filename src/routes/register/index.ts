import express, { Router } from "express"

const router = Router()
router.use(express.urlencoded())
router.get("/", (req, res) => {
    res.render('register');
})

router.post("/", (req, res) => {
    console.log(req.body);
    // Redirect to the home page
    res.redirect('/');
})


export default router