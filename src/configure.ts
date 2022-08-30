import { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import session from 'express-session';
import bodyParser from 'body-parser';
import { Router } from "./routes";
import { auth } from "./routes";
import { init } from './socket'
import { Kubero } from './kubero';
import { Addons } from './modules/addons';
import * as crypto from "crypto"

const { KUBER_SESSION_KEY = crypto.randomBytes(20).toString('hex') } = process.env;

export const before = (app: Express) => {
    app.use(cors())
    app.use(session({
        name: 'KuberoSessioneee',
        secret: KUBER_SESSION_KEY,
        resave: false,
        saveUninitialized: true,
    }));
    app.use(bodyParser.json());
    if (auth.authentication === true) {
        console.log("initialize Passport");
    
        app.use(auth.passport.initialize());
        app.use(auth.passport.session());
    }
}

export const after = (app: Express, server: Server) => {
    // Attache socket.io to server
    let sockets = init(server);
    const kubero = new Kubero(sockets);
    kubero.updateState();
    app.locals.kubero = kubero;
    const addons = new Addons({
        kubectl: kubero.kubectl
    });
    app.locals.addons = addons;
    app.use('/api', Router);
}
