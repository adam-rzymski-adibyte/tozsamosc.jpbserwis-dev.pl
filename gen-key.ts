import jose from 'node-jose';

const keystore = jose.JWK.createKeyStore();

const generateKeyRSA = async () => {
    const key = await keystore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' });
    console.log(key.toJSON(true));
}

const generateKeyEC = async () => {
    const key = await keystore.generate('EC', 'P-256', { alg: 'ES256', use: 'sig' });
    console.log(key.toJSON(true));
}

generateKeyRSA();
generateKeyEC();