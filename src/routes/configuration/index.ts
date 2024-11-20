import { Router } from "express"

const zgloszenia = {
    "authority": "https://tozsamosc.jpbserwis-dev.pl:444/oidc",
    "client_id": "JPBSerwisZgloszenia",
    "client_secret": null,
    "scope": "openid email profile roles offline_access ticketing_api ticketing",
    "response_type": "code",
    "redirect_uri": "https://zgloszenia.jpbserwis-dev.pl/authentication/login-callback",
    "post_logout_redirect_uri": "https://zgloszenia.jpbserwis-dev.pl/authentication/logout-callback",
    "loadUserInfo": false,
    "automaticSilentRenew": true,
    "monitorSession": true,
    "mode": "Development"
}

const router = Router()

// router.get("/*", (req, res) => {
//     res.json({
//         message: "Hello World"
//     })
// })

router.get("/JPBSerwisZgloszenia", (req, res) => {
    res.json(zgloszenia)
})

export default router