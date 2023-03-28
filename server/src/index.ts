// import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { UserResolver } from "./resolvers/user";
import "reflect-metadata";
import { PostResolver } from "./resolvers/post";
import {
    COOKIE_NAME,
    __prod__,
} from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { redis } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/redis";
import session from "express-session";
import RedisStore from "connect-redis";
import { MyContext } from "./types/default-types";
import cors from "cors";
import { DataSource } from "typeorm";
import { Post } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/entities/Post";
import { User } from "./entities/User";
import path from "path";
import { Updoot } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/entities/Updoot";

declare module "express-session" {
    interface SessionData {
        userId: any;
    }
}

export const conn = new DataSource({
    type: "postgres",
    database: "lireddit2",
    username: "postgres",
    password: "postgres",
    synchronize: true,
    logging: true,
    entities: [Post, User, Updoot],
    migrations: [path.join(__dirname, "./migrations/*")]
});

const main = async () => {
    let corsFlag = true;
    // corsFlag = false;

    await conn.initialize();
    await conn.runMigrations();

    const app = express();

    if (corsFlag) {
        app.use(
            cors({
                origin: "http://localhost:3000",
                credentials: true,
            })
        );
    }

    app.use(
        session({
            store: new RedisStore({
                client: redis as any,
            }),
            name: COOKIE_NAME,
            secret: "327trgv3weu78rhqyw389r5yh3gwu",
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: __prod__,
                maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
            },
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }): MyContext => ({ req, res, redis }),
        // plugins: [ ApolloServerPluginLandingPageGraphQLPlayground() ]
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: !corsFlag,
    });

    app.listen(4000, () => {
        console.log("\nServer started on localhost:4000\n");
    });
};

main().catch((err) => console.error(err));
