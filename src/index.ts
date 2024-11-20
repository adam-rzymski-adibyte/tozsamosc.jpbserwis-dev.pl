import express from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import config from 'config';
import { AppDataSource } from './data-source';
import { initializeOIDCProvider } from './oidcProvider';
import { Liquid } from 'liquidjs';

// [] - Add logo to login page
// [] - Create registration page
// [] - Create password reset page

const app = express();
const port = 444;

console.log('DB_HOST:', config.get<string>('MySQLConfig.host'));

const options = {
    host: config.get<string>('MySQLConfig.host'),
    port: config.get<number>('MySQLConfig.port'),
    username: config.get<string>('MySQLConfig.username'),
    password: config.get<string>('MySQLConfig.password'),
    database: config.get<string>('MySQLConfig.database'),
    key: fs.readFileSync('./certificates/JPBSERWIS-DEV-DOMAINS.key'),
    cert: fs.readFileSync('./certificates/JPBSERWIS-DEV-DOMAINS.crt'),
};

const startApp = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database initialized');
        setAppMiddlewares();

        await initializeOIDCProvider(app);
        startServer();
    } catch (err) {
        console.log(err);
    }
};

const setAppMiddlewares = () => {
    const engine = new Liquid({ extname: '.liquid' });
    app.engine('liquid', engine.express()); // register liquid engine
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'liquid');
};


const startServer = () => {
    const serverHttps = https.createServer(options, app);

    // serverHttps.listen(port, () => {
    //     console.log('HTTPS server listening on port port');
    // });
    
    // Non-HTTPS server
    const server = app.listen(port, () => {
        console.log(`HTTP server listening on port ${port}`);
    });
};

startApp();