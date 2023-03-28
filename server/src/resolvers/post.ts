import { PaginatedPosts } from "./../types/post-types";
import { MyContext } from "src/types/default-types";
import { textSlice } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/utils/textSlice";
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { conn } from "./../index";
import { PostInput } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/types/post-types";
import { Post } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/entities/Post";
import { isAuth } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/middleware/isAuth";
import { Updoot } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/entities/Updoot";

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post): string {
        return textSlice(root.text);
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() ctx: MyContext
    ) {
        const updatePostQuery = `
            UPDATE post
            SET points = points + $1
            WHERE id = $2
        `;

        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = ctx.req.session;

        const queryRunner = conn.createQueryRunner();
        const updoot = await queryRunner.manager.findOne(Updoot, {
            where: { userId, postId },
        });

        await queryRunner.startTransaction();
        try {
            if (updoot && updoot.value !== realValue) {
                // user is changing their vote

                // update the value in Updoot table
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Updoot)
                    .set({ value: realValue })
                    .where("postId = :postId", { postId })
                    .andWhere("userId = :userId", { userId })
                    .execute();

                // update post's points in Post table
                // 2x because we want to remove the previous vote
                await queryRunner.manager.query(updatePostQuery, [2 * realValue, postId]);
            } else if (!updoot) {
                // first time user is voting

                // creates an entry in the updoot table
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(Updoot)
                    .values({ userId, postId, value: realValue })
                    .execute();

                // updates post's points in Post table
                await queryRunner.manager.query(updatePostQuery, [realValue, postId]);
            }
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            return false;
        } finally {
            await queryRunner.release();
        }
        return true;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
        @Ctx() ctx: MyContext
    ): Promise<PaginatedPosts> {
        const realLimitPlusOne = Math.min(50, limit) + 1;
        const realLimit = Math.min(50, limit);
        const userId = ctx.req.session.userId ? ctx.req.session.userId : null;
        const replacements: any[] = [realLimitPlusOne, userId];
        if (cursor) replacements.push(new Date(parseInt(cursor)));
        const posts = await conn.query(
            `
            SELECT 
                p.*, 
                json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'email', u.email,
                    'createdAt', u."createdAt",
                    'updatedAt', u."updatedAt"
                ) creator,
                    ${
                        userId
                            ? '(SELECT value FROM updoot WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
                            : '$2 as "voteStatus"'
                    }
            FROM post p
            INNER JOIN public.user u on u.id = p."creatorId"
            ${cursor ? `WHERE p."createdAt" < $3` : ""}
            ORDER BY p."createdAt" DESC
            LIMIT $1
        `,
            replacements
        );
        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }

    @Query(() => Post, { nullable: true })
    async post(@Arg("id", () => Int) id: number): Promise<Post | null> {
        return await Post.findOne({ where: { id } });
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(@Arg("input", () => PostInput) input: PostInput, @Ctx() ctx: MyContext): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: ctx.req.session.userId,
        }).save();
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg("id", () => Int) id: number): Promise<boolean> {
        try {
            await Post.delete({ id });
        } catch {
            return false;
        }
        return true;
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String, { nullable: true }) title: string
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: { id } });

        if (!post) return null;

        if (typeof title !== "undefined") {
            await Post.update({ id }, { title });
        }

        return post;
    }
}
