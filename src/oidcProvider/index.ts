import cors from "cors";
import SequelizeAdapter from "../adapter/sequelize";
import { oidcConfiguration } from "../configurations/oidc";
import { Account } from "../entity/Account";
import routes from '../routes/interactions';
import configurationRouter from '../routes/configuration'
import registrationRouter from '../routes/register'

export const initializeOIDCProvider = async (app) => {
    const Provider = await import('oidc-provider');
    const issuer = 'https://tozsamosc.jpbserwis-dev.pl';
    const adapter = SequelizeAdapter;
    await adapter.connect();

    await createDefaultAccounts();

    const oidc = createOIDCProvider(Provider, issuer, adapter);
    setupOIDCProviderMiddlewares(oidc);
    setupOIDCRoutes(app, oidc);
};

const createDefaultAccounts = async () => {
    const accounts: Partial<Account>[] = [
        {
            username: 'administrator',
            password: 'Qwerty3002',
            email: 'adamrzymski@gmail.com',
            firstName: 'Adam',
            lastName: 'Rzymski',
            role: 'super-administrator',
            emailVerified: true,
        },
        {
            username: 'wspolnota-administrator',
            password: 'Qwerty3002',
            email: 'wspolnota@gmail.com',
            firstName: 'Adam',
            lastName: 'Wspolnota',
            role: 'administrator-wspólnoty',
            emailVerified: true,
        },
    ]

    await Promise.all(accounts.map(async (account) => {
        await createDefaultAccount(account);
    }));
};

const createDefaultAccount = async (accountToCreate: Partial<Account>) => {
    const [account, created] = await Account.findOrBuild({
        where: {
            username: accountToCreate.username
        },
        defaults: {
            username: accountToCreate.username,
            password: accountToCreate.password,
            email: accountToCreate.email,
            firstName: accountToCreate.firstName,
            lastName: accountToCreate.lastName,
            role: accountToCreate.role,
            emailVerified: accountToCreate.emailVerified,
        }
    });

    if (created) {
        await account.save();
        console.log('account saved');
    }
};

const createOIDCProvider = (Provider, issuer, adapter) => {
    const oidc = new Provider.default(issuer, { adapter, rotateRefreshToken: false, ...oidcConfiguration });
    oidc.on('introspection.error', handleClientAuthErrors);
    oidc.on('revocation.error', handleClientAuthErrors);
    oidc.on('grant.error', handleClientAuthErrors);
    oidc.on('authorization.error', handleClientAuthErrors);
    oidc.on('device_authorization.error', handleClientAuthErrors);
    oidc.on('pushed_authorization_request.error', handleClientAuthErrors);
    oidc.on('userinfo.error', handleClientAuthErrors);
    oidc.on('check_session.error', handleClientAuthErrors);
    oidc.on('discovery.error', handleClientAuthErrors);
    oidc.on('registration_update.error', handleClientAuthErrors);
    oidc.on('registration_delete.error', handleClientAuthErrors);
    oidc.on('registration_create.error', handleClientAuthErrors);
    oidc.on('client_credentials.error', handleClientAuthErrors);
    oidc.on('backchannel_authentication.error', handleClientAuthErrors);
    oidc.on('error', handleClientAuthErrors);
    return oidc;
};

const setupOIDCProviderMiddlewares = (oidc) => {
    oidc.use(async (ctx, next) => {
        console.log('pre middleware', ctx.method, ctx.path);
        await next();
        console.log('post middleware', ctx.method, ctx.oidc?.route);
    });
};

const setupOIDCRoutes = (app, oidc) => {
    const corsOptions = {
        origin: 'https://zgloszenia.jpbserwis-dev.pl'
    };

    app.use('/oidc', cors(corsOptions), oidc.callback());
    app.use('/_configuration', cors(corsOptions), configurationRouter);
    app.use('/register', cors(corsOptions), registrationRouter);
    routes(app, oidc);
};

const handleClientAuthErrors = (ctx, err) => {
    console.log(err);
    console.log('authorization', ctx.headers.authorization);
    console.log('body', ctx.oidc.body);
    console.log('client', ctx.oidc.client);
    console.log('params', ctx.oidc.params);
}