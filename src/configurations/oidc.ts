// import { Configuration } from "oidc-provider";
import c from "config";
import { Account } from "../entity/Account";

const isDev = false// process.env.NODE_ENV === 'development';

console.log(`isDev ${isDev}`);
const getAccessTokenTTL = (isDev: boolean): number => isDev ? 60 * 2 : 60 * 60; // 2 minute in dev mode, 1 hour otherwise
const getAuthorizationCodeTTL = (isDev: boolean): number => isDev ? 60 : 10 * 60; // 60 seconds in dev mode, 10 minutes otherwise
const getClientCredentialsTTL = (isDev: boolean): number => isDev ? 60 : 10 * 60; // 60 seconds in dev mode, 10 minutes otherwise
const getIdTokenTTL = (isDev: boolean): number => isDev ? 60 * 2 : 60 * 60; // 2 minute in dev mode, 1 hour otherwise
const getRefreshTokenTTL = (isDev: boolean): number => isDev ? 60 * 60 * 24 : 60 * 60 * 24 * 7; // 1 day in dev mode, 1 week otherwise

const accessTokenTTL = getAccessTokenTTL(isDev);
const authorizationCodeTTL = getAuthorizationCodeTTL(isDev);
const clientCredentialsTTL = getClientCredentialsTTL(isDev);
const idTokenTTL = getIdTokenTTL(isDev);
const refreshTokenTTL = getRefreshTokenTTL(isDev);

console.log(`accessTokenTTL ${accessTokenTTL}`);
console.log(`authorizationCodeTTL ${authorizationCodeTTL}`);
console.log(`clientCredentialsTTL ${clientCredentialsTTL}`);
console.log(`idTokenTTL ${idTokenTTL}`);
console.log(`refreshTokenTTL ${refreshTokenTTL}`);

export const oidcConfiguration = {
    // export const oidcConfiguration: Configuration = {
    clients: [{
        client_id: "JPBSerwisZgloszenia",
        grant_types: ["authorization_code", "refresh_token"],
        redirect_uris: ["https://zgloszenia.jpbserwis-dev.pl/authentication/login-callback", "https://oidcdebugger.com/debug"],
        post_logout_redirect_uris: ["https://zgloszenia.jpbserwis-dev.pl/authentication/logout-callback"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
        application_type: "web",
        scope: "openid offline_access email profile roles",
        allowedResources: ["https://zgloszenia.jpbserwis-dev.pl"],
        resourcesScopes: ["openid", "offline_access", "email", "profile", "roles"],
        //other configurations if needed
    }],
    claims: {
        openid: ["sub"],
        email: ["email", "email_verified"],
        profile: [
            "birthdate",
            "family_name",
            "gender",
            "given_name",
            "locale",
            "middle_name",
            "first_name",
            "last_name",
            "name",
            "nickname",
            "picture",
            "preferred_username",
            "profile",
            "updated_at",
            "website",
            "zoneinfo",
        ],
        roles: ["role"],
    },
    pkce: {
        methods: ["S256"],
        required: (ctx, client) => {
            // console.log("pkce Client", client);
            if (client.application_type === "web") {
                return true;
            }
            return false;
        }
    },
    issueRefreshToken: async (ctx, client, code) => {
        // console.log("issueRefreshToken Client", client);
        // console.log("issueRefreshToken Code", code);
        if (client.applicationType === "web" && client.grantTypes?.includes("refresh_token") && client.scope?.includes("offline_access")) {
            return true;
        }
        return false;
    },
    ttl: {
        AccessToken: accessTokenTTL, // 1 hour in seconds or 1 minute in dev mode
        AuthorizationCode: authorizationCodeTTL, // 10 minutes in seconds or 10 seconds in dev mode
        ClientCredentials: clientCredentialsTTL, // 10 minutes in seconds or 10 seconds in dev mode
        IdToken: idTokenTTL, // 1 hour in seconds or 1 minute in dev mode
        RefreshToken: refreshTokenTTL, // 1 week in seconds or 1 day in dev mode
    },
    features: {
        // registration: {
        //     enabled: true,
        //     idFactory: (ctx, client) => {
        //         return "1234567890";
        //     },
        //     initialAccessToken: async (ctx, client) => {
        //         return false;
        //     },
        //     issueRegistrationAccessToken: async (ctx, client) => {
        //         return true;
        //     },
        //     secretFactory: async (ctx, client) => {
        //         return "1234567890";
        //     },
        //     policies: undefined,
        // }, // defaults to false
        // registrationManagement: {
        //     enabled: true,
        //     rotateRegistrationAccessToken: false,
        // }, // defaults to false
        revocation: { enabled: true }, // defaults to false
        introspection: {
            // allowedPolicy: async (ctx, client, token) => {
            //     return true;
            // },
            enabled: true
        }, // defaults to false
        jwtUserinfo: { enabled: true }, // defaults to false
        devInteractions: { enabled: false }, // defaults to true
        clientCredentials: { enabled: true }, // defaults to false
        resourceIndicators: {
            // enabled: true,
            // defaultResource: (ctx, client, oneOf) => {
            //     return Array.isArray(ctx.oidc.params?.resource)
            //         ? ctx.oidc.params?.resource[0]
            //         : ctx.oidc.params?.resource;
            // },
            // useGrantedResource: async function useGrantedResource(ctx, model) {
            //     return true;
            // },
            getResourceServerInfo: async (ctx: any, resourceIndicator: string, client: any) => {
                console.log(">>----Client ressource allowed:", client.allowedResources)
                console.log(">>----Client ressource scopes:", client.resourcesScopes)
                console.log(">>----Client scope:", client.scope)
                console.log(">>----resourceIndicator is :", resourceIndicator)
                console.log(">>---- client is :", client)
                return {
                    audience: "JPBSerwisZgloszenia",
                    scope: client.scope,
                    profile: "https://zgloszenia.jpbserwis-dev.pl",
                    accessTokenFormat: "jwt",
                    jwt: {
                        sign: { alg: 'ES256' },
                    },
                };
            },
            defaultResource: (ctx, client, oneOf) => {
                // console.log('default resource', client);
                if (client.clientId === 'JPBSerwisZgloszenia') {
                    return 'https://zgloszenia.jpbserwis-dev.pl'
                }
                return "http://example.com";
            },
            enabled: true,
            // getResourceServerInfo: (ctx, resourceIndicator, client) => {
            //     return ({
            //         audience: 'solid',
            //         accessTokenTTL: 2 * 60 * 60, // 2 hours
            //         accessTokenFormat: 'jwt',
            //         jwt: {
            //             sign: { alg: 'ES256' },
            //         },
            //     });
            // },
            useGrantedResource: (ctx, model) => {
                // @param ctx - koa request context
                // @param model - depending on the request's grant_type this can be either an AuthorizationCode, BackchannelAuthenticationRequest,
                //                RefreshToken, or DeviceCode model instance.
                return true;
            }
        }, // defaults to false
        rpInitiatedLogout: {
            enabled: true,
            logoutSource: async (ctx, form) => {
                // @param ctx - koa request context
                // @param form - form source (id="op.logoutForm") to be embedded in the page and submitted by
                //   the End-User
                ctx.body = `<!DOCTYPE html>
                <html>
                  <head>
                    <title>Logout Request</title>
                    <link
                      href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
                      rel="stylesheet"
                      integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
                      crossorigin="anonymous"
                    >
                    <script
                      src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"
                      integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4"
                      crossorigin="anonymous"
                      defer
                    ></script>
                    <style>
                      /* Add any custom styles if needed */
                    </style>
                  </head>
                  <body>
                    <header>
                      <nav class="navbar navbar-expand-lg navbar-light bg-light">
                        <div class="container">
                          <a class="navbar-brand" href="/">
                              <!-- SVG content -->
                              <svg style="width: 160px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 3162.162 729.73" class="jpbserwis-logo d-inline-block align-top"><defs><linearGradient id="linearGradient745"><stop offset="0" stop-color="#8f5e25"></stop><stop offset="0.5" stop-color="#fbf4a1"></stop><stop offset="1" stop-color="#8f5e25"></stop></linearGradient><linearGradient id="linearGradient749" x1="207.957" x2="218.251" y1="7.421" y2="7.421" gradientTransform="matrix(.31571 .18418 -.25215 .3992 14.55 -43.275)" gradientUnits="userSpaceOnUse" xlink:href="#linearGradient745"></linearGradient><linearGradient id="linearGradient935" x1="207.957" x2="218.251" y1="7.421" y2="7.421" gradientTransform="matrix(.31571 .18418 -.25215 .3992 32.494 -43.275)" gradientUnits="userSpaceOnUse" xlink:href="#linearGradient745"></linearGradient></defs><g transform="matrix(8.1081 0 0 8.1081 81.081 81.081)"><defs><linearGradient id="SvgjsLinearGradient10305"><stop offset="0" stop-color="#8f5e25"></stop><stop offset="0.5" stop-color="#fbf4a1"></stop><stop offset="1" stop-color="#8f5e25"></stop></linearGradient><linearGradient id="SvgjsLinearGradient10309"><stop offset="0" stop-color="#8f5e25"></stop><stop offset="0.5" stop-color="#fbf4a1"></stop><stop offset="1" stop-color="#8f5e25"></stop></linearGradient><linearGradient id="SvgjsLinearGradient10313"><stop offset="0" stop-color="#8f5e25"></stop><stop offset="0.5" stop-color="#fbf4a1"></stop><stop offset="1" stop-color="#8f5e25"></stop></linearGradient></defs><g fill="url(#SvgjsLinearGradient10305)" transform="translate(-12.256 -12.256) scale(.94276)"><path d="M60.25 60.25l19.108-6.369c1.687-3.824 3.018-7.774 4.06-11.63H69.25l15.41-5.137c2.585-11.989 2.59-21.864 2.59-21.864s-45-9-63 9-9 36-9 36l36-18-36 27v18h9v-9s27 9 45-9c2.662-2.662 4.922-5.725 6.855-9H60.25z"></path></g><g fill="url(#SvgjsLinearGradient10309)" transform="matrix(1.06315 0 0 1.06315 89.333 -2.618)"><path d="M249.116 34.16q.48.08.8.48.32.4.32.88v2.96q0 .64-.48 1.08-.4.32-.92.32h-.2q-3.72-.56-6.12-2.44-3.12-2.48-3.52-6.92-.08-.64.36-1.1.44-.46 1.04-.46h3.16q.56 0 .96.38.4.38.44.94.12 2 1.96 3.08.84.48 2.2.8z"></path><path d="M253.796 15.8q-.48-.12-.78-.5-.3-.38-.3-.9v-2.92q0-.64.52-1.08.2-.2.52-.26t.6-.02q3.52.56 5.72 2.4 3 2.48 3.2 6.32.04.56-.38 1.02-.42.46-1.02.46h-3.12q-.52 0-.92-.36t-.44-.88q-.16-1.04-.68-1.72-.84-1-2.6-1.52-.12 0-.16-.04z"></path><path d="M260.476 24.84q1.72 1.08 2.62 2.64.9 1.56.9 3.48 0 4.52-3.44 6.92-2.32 1.68-6.28 2.12h-.16q-.56 0-.92-.36-.48-.44-.48-1.04v-2.88q0-.52.36-.92t.88-.48q1.88-.2 2.92-.88.8-.48 1.08-1.24.16-.44.16-1.12 0-.44-.16-.76t-.56-.6q-1.16-.8-3-1.36l-.64-.2q-2-.56-3.68-.92-.36-.08-1.16-.28l-.44-.12q-1.44-.36-3.04-1-2.36-1-3.88-2.52-1.76-1.76-1.76-4.64 0-3.96 3.04-6.44 2.08-1.76 5.84-2.24.64-.08 1.1.36.46.44.46 1.04v2.88q0 .52-.32.92t-.82.46q-.5.06-1.02.22-1.16.44-1.64.86t-.68.86q-.2.68-.2 1.28 0 .32.36.68.56.56 1.64 1 .48.2 1.68.6l5 1.24.24.08q1.88.52 2.72.8 1.88.64 3.28 1.56z"></path><path d="M232.152 10q.6 0 1 .42t.4.98v7.4q0 .6-.4 1.02-.4.42-1 .42h-3.04q-.56 0-.98-.42-.42-.42-.42-1.02v-7.4q0-.56.42-.98.42-.42.98-.42z"></path><path d="M232.152 21.88q.6 0 1 .42t.4 1.02v14.96q0 .56-.4.98-.4.42-1 .42h-3.04q-.56 0-.98-.42-.42-.42-.42-.98V23.32q0-.6.42-1.02.42-.42.98-.42z"></path><path d="M187.908 11l2.28 7.48q.24.68-.2 1.26t-1.16.58h-3.16q-.48 0-.86-.28t-.5-.72l-2.32-7.48q-.24-.68.2-1.26t1.12-.58h3.24q.48 0 .86.28t.5.72zm-.605-1.488l2.28 7.48q.24.68-.2 1.26t-1.16.58h-3.16q-.48 0-.86-.28t-.5-.72l-2.32-7.48q-.24-.68.2-1.26t1.12-.58h3.24q.48 0 .86.28t.5.72z"></path><path d="M222.948 10.6q.4.56.2 1.24l-8.44 27.08q-.12.44-.5.72-.38.28-.86.28h-3.48q-.44 0-.82-.28-.38-.28-.5-.68l-6-18.56-5.96 18.56q-.16.44-.52.7-.36.26-.84.26h-3.48q-.72 0-1.16-.56-.4-.68-.16-1.28l9.04-27.12q.12-.4.5-.68t.82-.28h3.52q.48 0 .84.28t.52.72l5.92 18.4 5.6-18.4q.16-.44.54-.72.38-.28.82-.28h3.24q.76 0 1.16.6z"></path><path d="M172.984 28.2l6.04 9.24q.44.72.04 1.44-.16.32-.5.52-.34.2-.7.2h-3.64q-.36 0-.68-.18-.32-.18-.48-.46l-6.08-9.64h-7.12v8.88q0 .56-.42.98-.42.42-.98.42h-3.04q-.56 0-.98-.42-.42-.42-.42-.98V25.04q0-.56.42-.98.42-.42.98-.42h12.32q3.52 0 4.68-2 .4-.64.4-1.84 0-1.88-1.24-2.96-1.28-1.16-3.68-1.16h-12.48q-.56 0-.98-.42-.42-.42-.42-.98V11.4q0-.56.42-.98.42-.42.98-.42h12.84q4.68 0 7.48 2.64 2.92 2.64 2.92 7.16 0 2.92-1.28 4.98-1.28 2.06-3.72 3.14z"></path><path d="M146.9 10q.6 0 1 .42t.4.98v2.92q0 .6-.4 1.02-.4.42-1 .42h-19.76q-.56 0-.98-.42-.42-.42-.42-1.02V11.4q0-.56.42-.98.42-.42.98-.42z"></path><path d="M127.14 27.72q-.56 0-.98-.42-.42-.42-.42-.98v-3q0-.56.42-.98.42-.42.98-.42h17.96q.6 0 1.02.42.42.42.42.98v3q0 .56-.42.98-.42.42-1.02.42z"></path><path d="M146.9 33.92q.6 0 1 .42t.4 1.02v2.92q0 .56-.4.98-.4.42-1 .42h-19.76q-.56 0-.98-.42-.42-.42-.42-.98v-2.92q0-.6.42-1.02.42-.42.98-.42z"></path><path d="M105.336 34.16q.48.08.8.48.32.4.32.88v2.96q0 .64-.48 1.08-.4.32-.92.32h-.2q-3.72-.56-6.12-2.44-3.12-2.48-3.52-6.92-.08-.64.36-1.1.44-.46 1.04-.46h3.16q.56 0 .96.38.4.38.44.94.12 2 1.96 3.08.84.48 2.2.8z"></path><path d="M110.016 15.8q-.48-.12-.78-.5-.3-.38-.3-.9v-2.92q0-.64.52-1.08.2-.2.52-.26t.6-.02q3.52.56 5.72 2.4 3 2.48 3.2 6.32.04.56-.38 1.02-.42.46-1.02.46h-3.12q-.52 0-.92-.36t-.44-.88q-.16-1.04-.68-1.72-.84-1-2.6-1.52-.12 0-.16-.04z"></path><path d="M116.696 24.84q1.72 1.08 2.62 2.64.9 1.56.9 3.48 0 4.52-3.44 6.92-2.32 1.68-6.28 2.12h-.16q-.56 0-.92-.36-.48-.44-.48-1.04v-2.88q0-.52.36-.92t.88-.48q1.88-.2 2.92-.88.8-.48 1.08-1.24.16-.44.16-1.12 0-.44-.16-.76t-.56-.6q-1.16-.8-3-1.36l-.64-.2q-2-.56-3.68-.92-.36-.08-1.16-.28l-.44-.12q-1.44-.36-3.04-1-2.36-1-3.88-2.52-1.76-1.76-1.76-4.64 0-3.96 3.04-6.44 2.08-1.76 5.84-2.24.64-.08 1.1.36.46.44.46 1.04v2.88q0 .52-.32.92t-.82.46q-.5.06-1.02.22-1.16.44-1.64.86t-.68.86q-.2.68-.2 1.28 0 .32.36.68.56.56 1.64 1 .48.2 1.68.6l5 1.24.24.08q1.88.52 2.72.8 1.88.64 3.28 1.56z"></path><path d="M78.488 24.36q2.08 1.28 3.04 3.68.56 1.28.56 3.16 0 2.92-1.56 4.9-1.56 1.98-4.56 2.94-1.88.64-4.44.64h-12.76q-.56 0-.98-.42-.42-.42-.42-.98V35.4q0-.6.42-1.02.42-.42.98-.42h13.08q2.32 0 3.44-.84.96-.8.96-2.18 0-1.38-1-2.26-1.24-1.08-3.72-1.08h-12.76q-.56 0-.98-.42-.42-.42-.42-1.02V23.4q0-.56.42-.98.42-.42.98-.42h12.04q1.72 0 2.68-.6.68-.4 1.08-1.16.28-.56.28-1.3t-.2-1.34q-.16-.48-.56-.88-.88-1-2.92-1h-12.4q-.56 0-.98-.42-.42-.42-.42-1.02V11.4q0-.56.42-.98.42-.42.98-.42h12.04q4.96 0 7.64 2.8 2.28 2.28 2.28 5.72 0 3.68-2.24 5.84z"></path><path d="M41.804 10q4.76 0 7.68 2.74t2.92 7.3q0 4.56-2.88 7.28-2.88 2.72-7.72 2.72h-7.64v8.16q0 .56-.42.98-.42.42-.98.42h-3.04q-.56 0-.98-.42-.42-.42-.42-.98V25.8q0-.56.42-.98.42-.42.98-.42h11.84q2.68 0 3.84-1.16 1.16-1.04 1.16-3.16t-1.2-3.26q-1.2-1.14-3.8-1.14h-11.84q-.56 0-.98-.42-.42-.42-.42-.98V11.4q0-.56.42-.98.42-.42.98-.42z"></path><path d="M19.76 10q.6 0 1.02.42.42.42.42.98v18q0 4.36-2.28 7.24-1.84 2.32-5.04 3.04-.12.04-.32.04-.56 0-.88-.32-.52-.4-.52-1.08v-3.08q0-.44.26-.8.26-.36.66-.52.96-.36 1.52-1.2.72-1.16.72-3.44V11.4q0-.56.42-.98.42-.42.98-.42z"></path><path d="M8.84 33.76q.4.16.62.52.22.36.22.76v3.24q0 .68-.56 1.12-.32.28-.84.28-.24 0-.36-.04-2.6-.6-4.4-2.4Q1 34.8.64 31.2q-.08-.6.36-1.06.44-.46 1.04-.46H5.2q.52 0 .92.34t.48.86q.24 1.32 1.24 2.2.44.44 1 .68z"></path></g><g fill="url(#SvgjsLinearGradient10313)" transform="matrix(.83832 0 0 .83832 89.737 45.814)"><path d="M4.42 16.88q.2.08.31.26t.11.38v1.62q0 .34-.28.56-.16.14-.42.14-.12 0-.18-.02-1.3-.3-2.2-1.2Q.5 17.4.32 15.6q-.04-.3.18-.53t.52-.23H2.6q.26 0 .46.17t.24.43q.12.66.62 1.1.22.22.5.34zM9.88 5q.3 0 .51.21t.21.49v9q0 2.18-1.14 3.62-.92 1.16-2.52 1.52-.06.02-.16.02-.28 0-.44-.16-.26-.2-.26-.54v-1.54q0-.22.13-.4t.33-.26q.48-.18.76-.6.36-.58.36-1.72V5.7q0-.28.21-.49T8.36 5h1.52zm20.094 13.86q.14.32-.07.65t-.57.33h-13.32q-.18 0-.34-.09t-.24-.23q-.22-.32-.06-.66l.62-1.46q.08-.2.26-.32t.38-.12h9.32l-3.28-7.84-2.68 6.4q-.08.2-.25.31t-.39.11h-1.68q-.38 0-.6-.32-.08-.14-.1-.32t.04-.34l4.06-9.52q.08-.2.25-.32t.39-.12h1.92q.22 0 .39.12t.25.32zm17.574-.16q.12.14.14.34t-.07.38-.26.28-.37.1h-1.9q-.18 0-.33-.08t-.25-.22l-4.78-6.88-1.96 1.84v4.64q0 .28-.21.49t-.49.21h-1.52q-.28 0-.49-.21t-.21-.49v-5.56q0-.32.22-.5l8.36-7.84q.2-.2.48-.2h2.16q.2 0 .38.12t.26.32.04.41-.2.37l-4.68 4.4zm-12-8.6q-.28 0-.49-.2t-.21-.5V5.7q0-.28.21-.49t.49-.21h1.52q.28 0 .49.21t.21.49v3.7q0 .3-.21.5t-.49.2h-1.52zm22.554-4.94q.24.2.24.54v1.5q0 .26-.15.45t-.41.25q-1.28.26-2.18 1.22-1.22 1.28-1.22 3.33t1.22 3.35q.9.94 2.18 1.2.26.06.41.25t.15.45v1.5q0 .32-.24.54-.22.16-.46.16h-.12q-2.32-.38-3.98-2.1-2.08-2.14-2.08-5.33t2.08-5.37q1.62-1.68 3.98-2.08.32-.06.58.14zm6.28 1.94q2.08 2.18 2.08 5.37t-2.08 5.33q-1.66 1.72-3.98 2.1h-.12q-.24 0-.46-.16-.24-.22-.24-.54v-1.5q0-.26.15-.45t.41-.25q1.28-.26 2.18-1.2 1.22-1.3 1.22-3.35t-1.22-3.33q-.9-.96-2.18-1.22-.26-.06-.41-.25t-.15-.45V5.7q0-.34.25-.54t.57-.14q2.36.4 3.98 2.08zm17.354 5.32q.86.54 1.31 1.32t.45 1.74q0 2.26-1.72 3.46-1.16.84-3.14 1.06h-.08q-.28 0-.46-.18-.24-.22-.24-.52v-1.44q0-.26.18-.46t.44-.24q.94-.1 1.46-.44.4-.24.54-.62.08-.22.08-.56 0-.22-.08-.38t-.28-.3q-.58-.4-1.5-.68l-.32-.1q-1-.28-1.84-.46-.18-.04-.58-.14l-.22-.06q-.72-.18-1.52-.5-1.18-.5-1.94-1.26-.88-.88-.88-2.32 0-1.98 1.52-3.22 1.04-.88 2.92-1.12.32-.04.55.18t.23.52v1.44q0 .26-.16.46t-.41.23-.51.11q-.58.22-.82.43t-.34.43q-.1.34-.1.64 0 .16.18.34.28.28.82.5.24.1.84.3l2.5.62.12.04q.94.26 1.36.4.94.32 1.64.78zm-3.34-4.52q-.24-.06-.39-.25t-.15-.45V5.74q0-.32.26-.54.1-.1.26-.13t.3-.01q1.76.28 2.86 1.2 1.5 1.24 1.6 3.16.02.28-.19.51t-.51.23h-1.56q-.26 0-.46-.18t-.22-.44q-.08-.52-.34-.86-.42-.5-1.3-.76-.06 0-.08-.02h-.08zm-2.34 9.18q.24.04.4.24t.16.44v1.48q0 .32-.24.54-.2.16-.46.16h-.1q-1.86-.28-3.06-1.22-1.56-1.24-1.76-3.46-.04-.32.18-.55t.52-.23h1.58q.28 0 .48.19t.22.47q.06 1 .98 1.54.42.24 1.1.4zM96.29 7.86q-.26-.04-.43-.24t-.17-.46V5.7q0-.34.24-.54t.56-.16q1.72.28 3.06 1.22 1.74 1.26 2.46 3.34.12.34-.08.64t-.58.3h-1.6q-.22 0-.4-.11t-.26-.31q-.44-1.04-1.34-1.66-.7-.44-1.46-.56zm5.06 6.64q.38 0 .58.3t.08.64q-.72 2.08-2.46 3.34-1.34.94-3.06 1.22h-.1q-.28 0-.46-.18-.24-.18-.24-.52v-1.46q0-.26.16-.46t.42-.24q.84-.12 1.48-.56.9-.62 1.34-1.66.08-.2.26-.31t.4-.11h1.6zm-7.16-9.26q.26.2.26.54v1.56q0 .22-.15.41t-.37.27q-.28.06-.44.14-.8.36-1.36.98-1.14 1.28-1.14 3.35t1.14 3.37q.7.8 1.8 1.12.22.06.37.25t.15.41v1.58q0 .34-.26.54-.18.16-.46.16h-.14q-2.14-.46-3.62-2.08-1.9-2.14-1.9-5.34t1.9-5.34q1.48-1.64 3.62-2.06.32-.08.6.14zM116.118 5q.3 0 .51.21t.21.51v1.46q0 .3-.21.51t-.51.21h-2.06q-.28 0-.49-.21t-.21-.51V5.72q0-.3.21-.51t.49-.21h2.06zm8.94 0q.28 0 .49.21t.21.51v1.46q0 .3-.21.51t-.49.21h-4.02v11.36q0 .28-.21.49t-.49.21h-1.54q-.3 0-.51-.21t-.21-.49V5.72q0-.3.21-.51t.51-.21h6.26zm11.494.16q.24.2.24.54v1.5q0 .26-.15.45t-.41.25q-1.28.26-2.18 1.22-1.22 1.28-1.22 3.33t1.22 3.35q.9.94 2.18 1.2.26.06.41.25t.15.45v1.5q0 .32-.24.54-.22.16-.46.16h-.12q-2.32-.38-3.98-2.1-2.08-2.14-2.08-5.33t2.08-5.37q1.62-1.68 3.98-2.08.32-.06.58.14zm6.28 1.94q2.08 2.18 2.08 5.37t-2.08 5.33q-1.66 1.72-3.98 2.1h-.12q-.24 0-.46-.16-.24-.22-.24-.54v-1.5q0-.26.15-.45t.41-.25q1.28-.26 2.18-1.2 1.22-1.3 1.22-3.35t-1.22-3.33q-.9-.96-2.18-1.22-.26-.06-.41-.25t-.15-.45V5.7q0-.34.25-.54t.57-.14q2.36.4 3.98 2.08zM169.96 5q.28 0 .49.21t.21.49v13.4q0 .28-.21.49t-.49.21h-1.76q-.36 0-.58-.28l-9.78-13.4q-.12-.16-.14-.36t.07-.38.26-.28.37-.1h1.76q.16 0 .32.07t.24.21l7.02 9.54V5.7q0-.28.2-.49t.5-.21h1.52zm-10.04 9.7q.28 0 .49.2t.21.5v3.7q0 .28-.21.49t-.49.21h-1.52q-.28 0-.49-.21t-.21-.49v-3.7q0-.3.21-.5t.49-.2h1.52zm30.234 4.16q.14.32-.07.65t-.57.33h-13.32q-.18 0-.34-.09t-.24-.23q-.22-.32-.06-.66l.62-1.46q.08-.2.26-.32t.38-.12h9.32l-3.28-7.84-2.68 6.4q-.08.2-.25.31t-.39.11h-1.68q-.38 0-.6-.32-.08-.14-.1-.32t.04-.34l4.06-9.52q.08-.2.25-.32t.39-.12h1.92q.22 0 .39.12t.25.32zm14.654-6.44q.86.54 1.31 1.32t.45 1.74q0 2.26-1.72 3.46-1.16.84-3.14 1.06h-.08q-.28 0-.46-.18-.24-.22-.24-.52v-1.44q0-.26.18-.46t.44-.24q.94-.1 1.46-.44.4-.24.54-.62.08-.22.08-.56 0-.22-.08-.38t-.28-.3q-.58-.4-1.5-.68l-.32-.1q-1-.28-1.84-.46-.18-.04-.58-.14l-.22-.06q-.72-.18-1.52-.5-1.18-.5-1.94-1.26-.88-.88-.88-2.32 0-1.98 1.52-3.22 1.04-.88 2.92-1.12.32-.04.55.18t.23.52v1.44q0 .26-.16.46t-.41.23-.51.11q-.58.22-.82.43t-.34.43q-.1.34-.1.64 0 .16.18.34.28.28.82.5.24.1.84.3l2.5.62.12.04q.94.26 1.36.4.94.32 1.64.78zm-3.34-4.52q-.24-.06-.39-.25t-.15-.45V5.74q0-.32.26-.54.1-.1.26-.13t.3-.01q1.76.28 2.86 1.2 1.5 1.24 1.6 3.16.02.28-.19.51t-.51.23h-1.56q-.26 0-.46-.18t-.22-.44q-.08-.52-.34-.86-.42-.5-1.3-.76-.06 0-.08-.02h-.08zm-2.34 9.18q.24.04.4.24t.16.44v1.48q0 .32-.24.54-.2.16-.46.16h-.1q-1.86-.28-3.06-1.22-1.56-1.24-1.76-3.46-.04-.32.18-.55t.52-.23h1.58q.28 0 .48.19t.22.47q.06 1 .98 1.54.42.24 1.1.4zm23.254.04q.28 0 .49.21t.21.49v1.44q0 .28-.21.49t-.49.21h-10.74q-.28 0-.49-.21t-.21-.49V17.8q0-.24.16-.44l2.86-3.46q.22-.26.54-.26h1.92q.2 0 .38.11t.27.3.06.4-.17.35l-1.92 2.32h7.34zm0-12.12q.28 0 .49.21t.21.51v1.46q0 .26-.16.46l-2.86 3.42q-.2.26-.54.26h-1.9q-.2 0-.38-.11t-.28-.29q-.16-.44.1-.76l1.92-2.3h-7.2q-.3 0-.51-.21t-.21-.51V5.72q0-.3.21-.51t.51-.21h10.6zm19.194 13.86q.14.32-.07.65t-.57.33h-13.32q-.18 0-.34-.09t-.24-.23q-.22-.32-.06-.66l.62-1.46q.08-.2.26-.32t.38-.12h9.32l-3.28-7.84-2.68 6.4q-.08.2-.25.31t-.39.11h-1.68q-.38 0-.6-.32-.08-.14-.1-.32t.04-.34l4.06-9.52q.08-.2.25-.32t.39-.12h1.92q.22 0 .39.12t.25.32zM260.484 5q2.38 0 3.84 1.37t1.46 3.65-1.44 3.64-3.86 1.36h-3.82v4.08q0 .28-.21.49t-.49.21h-1.52q-.28 0-.49-.21t-.21-.49v-6.2q0-.28.21-.49t.49-.21h5.92q1.34 0 1.92-.58.58-.52.58-1.58t-.6-1.63-1.9-.57h-5.92q-.28 0-.49-.21t-.21-.49V5.7q0-.28.21-.49t.49-.21h6.04zm23.594 13.86q.14.32-.07.65t-.57.33h-13.32q-.18 0-.34-.09t-.24-.23q-.22-.32-.06-.66l.62-1.46q.08-.2.26-.32t.38-.12h9.32l-3.28-7.84-2.68 6.4q-.08.2-.25.31t-.39.11h-1.68q-.38 0-.6-.32-.08-.14-.1-.32t.04-.34l4.06-9.52q.08-.2.25-.32t.39-.12h1.92q.22 0 .39.12t.25.32zm14.654-6.44q.86.54 1.31 1.32t.45 1.74q0 2.26-1.72 3.46-1.16.84-3.14 1.06h-.08q-.28 0-.46-.18-.24-.22-.24-.52v-1.44q0-.26.18-.46t.44-.24q.94-.1 1.46-.44.4-.24.54-.62.08-.22.08-.56 0-.22-.08-.38t-.28-.3q-.58-.4-1.5-.68l-.32-.1q-1-.28-1.84-.46-.18-.04-.58-.14l-.22-.06q-.72-.18-1.52-.5-1.18-.5-1.94-1.26-.88-.88-.88-2.32 0-1.98 1.52-3.22 1.04-.88 2.92-1.12.32-.04.55.18t.23.52v1.44q0 .26-.16.46t-.41.23-.51.11q-.58.22-.82.43t-.34.43q-.1.34-.1.64 0 .16.18.34.28.28.82.5.24.1.84.3l2.5.62.12.04q.94.26 1.36.4.94.32 1.64.78zm-3.34-4.52q-.24-.06-.39-.25t-.15-.45V5.74q0-.32.26-.54.1-.1.26-.13t.3-.01q1.76.28 2.86 1.2 1.5 1.24 1.6 3.16.02.28-.19.51t-.51.23h-1.56q-.26 0-.46-.18t-.22-.44q-.08-.52-.34-.86-.42-.5-1.3-.76-.06 0-.08-.02h-.08zm-2.34 9.18q.24.04.4.24t.16.44v1.48q0 .32-.24.54-.2.16-.46.16h-.1q-1.86-.28-3.06-1.22-1.56-1.24-1.76-3.46-.04-.32.18-.55t.52-.23h1.58q.28 0 .48.19t.22.47q.06 1 .98 1.54.42.24 1.1.4zm15.654-.2q.2.08.31.26t.11.38v1.62q0 .34-.28.56-.16.14-.42.14-.12 0-.18-.02-1.3-.3-2.2-1.2-1.26-1.22-1.44-3.02-.04-.3.18-.53t.52-.23h1.58q.26 0 .46.17t.24.43q.12.66.62 1.1.22.22.5.34zM314.166 5q.3 0 .51.21t.21.49v9q0 2.18-1.14 3.62-.92 1.16-2.52 1.52-.06.02-.16.02-.28 0-.44-.16-.26-.2-.26-.54v-1.54q0-.22.13-.4t.33-.26q.48-.18.76-.6.36-.58.36-1.72V5.7q0-.28.21-.49t.49-.21h1.52zm20.094 13.86q.14.32-.07.65t-.57.33H320.3q-.18 0-.34-.09t-.24-.23q-.22-.32-.06-.66l.62-1.46q.08-.2.26-.32t.38-.12h9.32l-3.28-7.84-2.68 6.4q-.08.2-.25.31t-.39.11h-1.68q-.38 0-.6-.32-.08-.14-.1-.32t.04-.34l4.06-9.52q.08-.2.25-.32T326 5h1.92q.22 0 .39.12t.25.32z"></path><path fill="url(#linearGradient749)" stroke-width="0.415" d="M80.18.251l-.818 3.085q-.063.288-.35.397-.287.108-.547-.044l-1.145-.667q-.174-.102-.25-.28-.076-.177-.022-.356l.804-3.093q.062-.287.35-.396.286-.11.532.035l1.174.684q.173.102.25.28.076.177.022.355zm.108-.645L79.47 2.69q-.063.287-.35.396-.287.109-.547-.043l-1.145-.668q-.174-.101-.25-.279-.076-.178-.022-.356l.804-3.093q.062-.288.35-.397.286-.109.532.035l1.174.685q.173.101.25.279.075.177.022.356z"></path><path fill="url(#linearGradient935)" stroke-width="0.415" d="M98.123.251l-.818 3.085q-.063.288-.35.397-.286.108-.547-.044l-1.145-.667q-.173-.102-.25-.28-.075-.177-.022-.356l.804-3.093q.063-.287.35-.396.286-.11.532.035l1.174.684q.174.102.25.28.076.177.022.355zm.108-.645l-.818 3.085q-.063.287-.35.396-.287.109-.547-.043l-1.145-.668q-.173-.101-.25-.279-.076-.178-.022-.356l.804-3.093q.062-.288.35-.397.286-.109.532.035l1.174.685q.174.101.25.279.076.177.022.356z"></path></g></g></svg>
                              <h3 class="d-inline-block align-bottom">Serwer Tożsamości</h3>
                              </a>
                              <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                              </button>
                              <div class="collapse navbar-collapse" id="navbarCollapse">
                                <!-- Add any additional navigation items if needed -->
                              </div>
                            </div>
                          </nav>
                        </header>
                        <div class="container">
                          <div class="text-center" style="padding: 121px;">
                            <p>Za chwilę zostaniesz przekierowany na do serwisu ${ctx.host}</p>
                            ${form}
                          </div>
                        </div>
                        <script>
                            setTimeout(function() {
                                document.forms[0].submit();
                            }, 1000);
                        </script>
                      </body>
                    </html>`;
            },
            // logoutSource: async (ctx, form) => {
            //     return form;
        },
    },
    jwks: {
        keys: [
            {
                kty: 'RSA',
                kid: 'AuDWg7GCQe4ISdmtCYniJEVWXcudlCN1RbWx4ABPoMI',
                use: 'sig',
                alg: 'RS256',
                e: 'AQAB',
                n: 'nvl6MIlMhG6XlZBUbt9WVblmsC_VMw7SJMSuDLNqDmJFmkqB7dLeDBk1uW3bXyeuRGZaLd4J6OU4xAW1faLAu_4VQ7MELeAyXIrf8-6L6yNq4Me58iradO5iaTXtCkMzE7XeFk8g4383bmq0daOmUbTsi7IJZ_jy_L1XfgMzdCjuBCxiwnyoQEI7fO3r_knIZw0nJR_YWlSWWXBXE_qMxdezzMIoozyJPYoeXcpzYoIXQmlFcMTmaqhhsyVt4Zv2D4iCDrqEzZi9fSChxqa7P-LGLQz605e2VzwAYSh0H-bszQjj86o9Vqv0nypbT6S88F6ut1SYBd5jAgr1f7QTKQ',
                d: 'Cxu41mcjn_3XzPk_sxsbPeR1eNJw0e9jTvMoy8WmH6DthuNVqpvxTNReoQk8eszLpCcoPjv9gobw1V6mQMQEdmZhz0AVJsz7i-Se0z1MDNdF1rTSCQpGR0UofnxIhs7tBN-wh-vJyye2pHojh7RSkPNE05qSRm_6b59d25Xm7KL61C-1xcjEqwSXqY7q5DlQract3wVnpGSxnR0ZBjH-8spDe-iiyou7J4mqoSlZQwYbWT1BkBQScVqq4d42zrmn6YNB6moUaaEB781lm3NK8A2g3paA8vWVC-QEoZvJUMYJfWbmDaZWLF4nx6mLucIWx7zrm6oW00bNiG6H-MIN4Q',
                p: 'yu7h8RPoT6eC-HXL4vBsp61RAn-_-oiGcfN-zxo3D8XOR8osq6Xpl-bsH2SuJlVZnPk-gFJI2wApmN9kgGvKR-5NsEun8fWnGhHENdomtTf7WyzVk2XB3dai3M5oQTtFIKtGVv-tOFVqQHCeYErIfZvq2TuXyCVTq9exF7sOraE',
                q: 'yIvWab57Rr2dTDq72QopouWj_eTmS_IHRkPfc-6cIbOrLrBkocjPHNf6tV2cbz478ivIxsN0B0FfX_Vd5l72vjo1drUo9Vi8B-a_c5WFWPpy26A-zx-1mnrLb7EcUSIXaMEIiVSmhtzcCUpDbMkDQ_HOxoSCn-8Y7c-xrI64KIk',
                dp: 'Ac4kNmfN7j94O8uYd7lZzhgNm28Vfx4NzB-1ZhQ-nyZMUnkq8o_0RwSn3xOfNPoXZP0WoD-bJE-ZDyIVm8rZrtAg4suZf96GkQXNcAkzxPLtin8Ym0oRcm7BXiN76_CiCctcQdPeb5za6B3YWtTveaaUbUBJdl9WojW1_pcMZ2E',
                dq: 'MPOZQbSCKNFN3PaVNbQ6V43QSsAdyrnoNqmImKbMq5lMlpft6GO40mSRyMVx0uGRBlrTpli9MKwvWJ_u7LWPav2QYUp1FfYz54XWg6MiqoZvlNZ3nl0yGeQRVlEYBWHZ7vL3X3YvM8ojV40uChbC2kni3CgqLlnRbvL8fo9Tumk',
                qi: 'WRULz8CSXxoLimkuAREHgbqvY0Jnkzj8h1L7GlGfCf96_qXWWGacjJG6j2jaRuqaBpDfNO5RbCY1B_ceMInoX97CJbY03aMUiKryYamfnQVI7QXHsqw-0ITS4RAkb2dybnIBHRTbbmdG5TTNHT_4jaKelF8AyoPUKY4IeQ50ubw'
            }, {
                kty: 'EC',
                kid: 'iNZGG5YmepqpUnULoL5D1Mfc4F35BHfjGYGgeeVPO-Q',
                use: 'sig',
                alg: 'ES256',
                crv: 'P-256',
                x: 'gU1Jiv1NSu7PL6fhaYlk-UIl5FtPelbt8hNcI3-RtyE',
                y: 'MFEuMtsAxZ-GHYeXdVSsLM9y2cf7mkNUFZjGEC-ngcQ',
                d: 'k1eByVz85YwsiOwwwBUHwK5aPEfy-I2w_hmLXUd92vc'
            }
        ],
    },
    extraClientMetadata: {
        properties: [
            'allowedResources',
            'resourcesScopes',
        ],
    },

    extraTokenClaims: async (ctx, token) => {
        // console.log('extraTokenClaims', ctx, token);
        const account = await Account.findById(token.accountId);
        const { scope } = token;
        if (!scope) return undefined;
        const openid = { sub: account.dataValues.id };
        const email = {
            email: account.dataValues.email,
            email_verified: account.dataValues.emailVerified,
        };
        const roles = {
            role: account.dataValues.role,
        };
        const profile = {
            first_name: account.dataValues.firstName,
            last_name: account.dataValues.lastName,
        };
        return {
            profile: {
                ...(scope.includes("openid") && openid),
                ...(scope.includes("email") && email),
                ...(scope.includes("roles") && roles),
                ...(scope.includes("profile") && profile),
            }
        };
    },
    // scopes: ['openid', 'email', 'profile'],
    async findAccount(ctx, id) {
        // console.log('findAccount', id);
        const account = await Account.findById(id);
        // console.log('account', account);
        return {
            accountId: id,
            // async claims() { return { sub: account.dataValues.id }; },
            async claims(use, scope, claims) {
                // console.log('claims', claims);
                // console.log('scope', scope);
                // console.log('use', use);
                if (!scope) return undefined;
                const openid = { sub: account.dataValues.id };
                const email = {
                    email: account.dataValues.email,
                    email_verified: account.dataValues.emailVerified,
                };
                const roles = {
                    role: account.dataValues.role,
                };
                const profile = {
                    first_name: account.dataValues.firstName,
                    last_name: account.dataValues.lastName,
                };
                return {
                    ...(scope.includes("openid") && openid),
                    ...(scope.includes("email") && email),
                    ...(scope.includes("roles") && roles),
                    ...(scope.includes("profile") && profile),
                };
            },
        };
    },
    interactions: {
        url: async (ctx, interaction) => {
            // console.log('interactionsUrl', ctx, interaction);
            return `/interaction/${interaction.uid}`;
        }
    },
};