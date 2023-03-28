import { dedupExchange, Exchange, fetchExchange, gql, stringifyVariables } from "urql";
import {
    LoginMutation,
    MeQuery,
    MeDocument,
    RegisterMutation,
    LogoutMutation,
    VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { tap, pipe } from "wonka";
import Router from "next/router";
import { isServer } from "./isServer";

const errorExchange: Exchange =
    ({ forward }) =>
    (ops$) => {
        return pipe(
            forward(ops$),
            tap(({ error }) => {
                if (error?.message.includes("not auth")) Router.replace("/login");
            })
        );
    };

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isCached = cache.resolve(entityKey, fieldKey);
        info.partial = !isCached;
        const results: string[] = [];
        let hasMore = true;
        fieldInfos.forEach((fi) => {
            const key = cache.resolve(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, "posts") as string[];
            hasMore = cache.resolve(key, "hasMore") as boolean;
            results.push(...data);
        });
        return {
            __typename: "PaginatedPosts",
            posts: results,
            hasMore,
        };
    };
};

const invalidatePostsCache = (cache) => {
    const allFields = cache.inspectFields("Query");
    const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
    fieldInfos.forEach((fi) => {
        cache.invalidate("Query", "posts", fi.arguments || {});
    });
};

const getVotes = (args, cache) => {
    const { postId, value } = args as VoteMutationVariables;
    const data = cache.readFragment(
        gql`
            fragment _ on Post {
                id
                points
                voteStatus
            }
        `,
        { id: postId }
    );
    if (data.voteStatus === value) return;
    if (data) {
        const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value;
        cache.writeFragment(
            gql`
                fragment _ on Post {
                    points
                    voteStatus
                }
            `,
            { id: postId, points: newPoints, voteStatus: value }
        );
    }
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
    return {
        url: "http://localhost:4000/graphql",
        fetchOptions: {
            credentials: "include" as const,
        },
        exchanges: [
            dedupExchange,
            cacheExchange({
                resolvers: {
                    Query: {
                        posts: cursorPagination(),
                    },
                },
                updates: {
                    Query: {
                        me: (result, args, cache, info) => invalidatePostsCache(cache),
                    },
                    Mutation: {
                        vote: (result, args, cache, info) => getVotes(args, cache),
                        createPost: (result, args, cache, info) => invalidatePostsCache(cache),
                        login: (result, args, cache, info) => {
                            betterUpdateQuery<LoginMutation, MeQuery>(cache, { query: MeDocument }, result, (r, q) => {
                                if (r.login.errors) return q;
                                else return { me: r.login.user };
                            });
                        },
                        register: (result, args, cache, info) => {
                            betterUpdateQuery<RegisterMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                result,
                                (r, q) => {
                                    if (r.register.errors) return q;
                                    else return { me: r.register.user };
                                }
                            );
                        },
                        logout: (result, args, cache, info) => {
                            betterUpdateQuery<LogoutMutation, MeQuery>(cache, { query: MeDocument }, result, () => ({
                                me: null,
                            }));
                        },
                    },
                },
            }),
            errorExchange,
            ssrExchange,
            fetchExchange,
        ],
    };
};
