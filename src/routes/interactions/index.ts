/* eslint-disable no-console, camelcase, no-unused-vars */
import { strict as assert } from 'node:assert';
import * as querystring from 'node:querystring';
import { inspect } from 'node:util';

import isEmpty from 'lodash/isEmpty.js';
import { urlencoded } from 'express'; // eslint-disable-line import/no-unresolved
import { Account } from '../../entity/Account';
import { Client, ConfirmationFlags, Details, Params } from './interface';
// import Account from '../../support/Accounts';

const body = urlencoded({ extended: false });

const keys = new Set();
const debug = (obj) => querystring.stringify(Object.entries(obj).reduce((acc, [key, value]) => {
    keys.add(key);
    if (isEmpty(value)) return acc;
    acc[key] = inspect(value, { depth: null });
    return acc;
}, {}), '<br/>', ': ', {
    encodeURIComponent(value) { return keys.has(value) ? `<strong>${value}</strong>` : value; },
});

export default (app, provider) => {
    const { constructor: { } } = provider;

    app.use((req, res, next) => {
        const orig = res.render;
        // you'll probably want to use a full blown render engine capable of layouts
        res.render = (view, locals) => {
            app.render(view, locals, (err, html) => {
                // console.log(`app.render`, view, locals, err, html);
                if (err) throw err;
                orig.call(res, '_layout', {
                    ...locals,
                    body: html,
                });
            });
        };
        next();
    });

    function setNoCache(req, res, next) {
        res.set('cache-control', 'no-store');
        next();
    }

    app.get('/interaction/:uid', setNoCache, async (req, res, next) => {
        try {
            const {
                uid, prompt, params, session,
            } = await provider.interactionDetails(req, res);

            const { body } = req;

            console.log(`app.get('/interaction/:uid' ${req.params.uid} ${prompt.name} ${params.client_id}`);
            console.log(prompt, req.body);
            const client = await provider.Client.find(params.client_id);

            const { details } = prompt;

            const flags = generateConfirmationFlags(client, details, params);

            switch (prompt.name) {
                case 'login': {
                    return res.render('login', {
                        client,
                        uid,
                        details: details,
                        params,
                        title: 'Logowanie',
                        session: session ? debug(session) : undefined,
                        dbg: {
                            params: debug(params),
                            prompt: debug(prompt),
                            flags: flags ? debug(flags) : undefined,
                            body: body ? debug(body) : undefined,
                        },
                        flags,
                    });
                }
                case 'consent': {
                    return res.render('interaction', {
                        client,
                        uid,
                        details: details,
                        params,
                        title: 'Autoryzuj',
                        session: session ? debug(session) : undefined,
                        dbg: {
                            params: debug(params),
                            prompt: debug(prompt),
                            flags: flags ? debug(flags) : undefined,
                            body: body ? debug(body) : undefined,
                        },
                        flags,
                    });
                }
                default:
                    return undefined;
            }
        } catch (err) {
            return next(err);
        }
    });

    app.post('/interaction/:uid/login', setNoCache, body, async (req, res, next) => {
        try {
            const details = await provider.interactionDetails(req, res);
            const { prompt: { name } } = details;
            assert.equal(name, 'login');
            // console.log(`Here we will have to handle login for: ${req.params.uid} with login: ${req.body.login} and password: ${req.body.password}`);
            const account = await Account.findByLogin(req.body.login);
            const passwordVerified = await Account.verifyPassword(req.body.password, account.password);
            // console.log(`account `, account, `passwordVerified `, passwordVerified);
            if (!passwordVerified) {
                return res.render('login', {
                    client: await provider.Client.find(details.params.client_id),
                    uid: req.params.uid,
                    details: details.prompt.details,
                    params: details.params,
                    title: 'Logowanie',
                    flash: 'Nieprawidłowy login lub hasło.',
                    session: details.session ? debug(details.session) : undefined,
                    dbg: {
                        session: debug(details.session),
                        params: debug(details.params),
                    },
                });
            }

            const result = {
                login: {
                    accountId: account.id,
                },
            };

            await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        } catch (err) {
            next(err);
        }
    });

    app.post('/interaction/:uid/confirm', setNoCache, body, async (req, res, next) => {
        try {
            // console.log(`interaction ${req.params.uid} confirm`);
            const interactionDetails = await provider.interactionDetails(req, res);
            const { prompt: { name, details }, params, session: { accountId } } = interactionDetails;
            assert.equal(name, 'consent');

            let { grantId } = interactionDetails;
            let grant;

            if (grantId) {
                // we'll be modifying existing grant in existing session
                grant = await provider.Grant.find(grantId);
            } else {
                // we're establishing a new grant
                grant = new provider.Grant({
                    accountId,
                    clientId: params.client_id,
                });
            }

            if (details.missingOIDCScope) {
                grant.addOIDCScope(details.missingOIDCScope.join(' '));
            }
            if (details.missingOIDCClaims) {
                grant.addOIDCClaims(details.missingOIDCClaims);
            }
            if (details.missingResourceScopes) {
                for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
                    grant.addResourceScope(indicator, (scopes as any).join(' '));
                }
            }

            grantId = await grant.save();

            const consent: any = {};
            if (!interactionDetails.grantId) {
                // we don't have to pass grantId to consent, we're just modifying existing one
                consent.grantId = grantId;
            }

            const result = { consent };
            await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
        } catch (err) {
            next(err);
        }
    });

    app.get('/interaction/:uid/abort', setNoCache, async (req, res, next) => {
        try {
            // console.log(`interaction ${req.params.uid} abort`);
            const result = {
                error: 'access_denied',
                error_description: 'End-User aborted interaction',
            };
            await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        } catch (err) {
            next(err);
        }
    });

    app.use((err, req, res, next) => {
        // if (err instanceof SessionNotFound) {
        // handle interaction expired / session not found error
        // }
        console.error(err); // eslint-disable-line no-console
        next(err);
    });
};


const generateConfirmationFlags = (client: Client, details: Details, params: Params): ConfirmationFlags => {
    const flags: ConfirmationFlags = {
        hasLogo: !!client.logoUri,
        logoUri: client.logoUri,
        requiresAuthorizationConfirmation: false,
        missingScopes: [],
        missingClaims: [],
        missingResourceScopes: [],
        requiresOfflineAccess: false,
        hasGrantedOfflineAccess: false,
    };

    if (details.missingOIDCScope || details.missingOIDCClaims || details.missingResourceScopes) {
        flags.requiresAuthorizationConfirmation = true;
    }

    if (details.missingOIDCScope) {
        const missingOIDCScope = new Set(details.missingOIDCScope);
        missingOIDCScope.delete('openid');
        missingOIDCScope.delete('offline_access');
        flags.missingScopes = Array.from(missingOIDCScope);
    }

    if (details.missingOIDCClaims) {
        const missingOIDCClaims = new Set(details.missingOIDCClaims);
        ['sub', 'sid', 'auth_time', 'acr', 'amr', 'iss'].forEach((claim) =>
            missingOIDCClaims.delete(claim)
        );
        flags.missingClaims = Array.from(missingOIDCClaims);
    }

    if (details.missingResourceScopes) {
        for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
            flags.missingResourceScopes.push({ indicator, scopes });
        }
    }

    if (params.scope && params.scope.includes('offline_access')) {
        flags.requiresOfflineAccess = true;
        if (!details.missingOIDCScope || !details.missingOIDCScope.includes('offline_access')) {
            flags.hasGrantedOfflineAccess = true;
        }
    }

    return flags;
}
