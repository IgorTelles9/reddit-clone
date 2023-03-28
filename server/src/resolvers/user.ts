import { createChangePasswordEmail } from "./../utils/createChangePasswordEmail";
import { postValidateRegister } from "./../utils/postValidateRegister";
import { preValidateRegister } from "./../utils/preValidateRegister";
import { User } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/entities/User";
import { MyContext } from "src/types/default-types";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import argon2 from "argon2";
import {
    UserResponse,
    UsernamePasswordInput,
} from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/types/user-types";
import {
    CHANGE_PASSWORD_PREFIX,
    COOKIE_NAME,
} from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/constants";
import { FieldError } from "src/types/error-types";
import { sendEmail } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/utils/sendEmail";
import { v4 } from "uuid";

@Resolver(User)
export class UserResolver {

    @FieldResolver( () => String) 
    email(@Root() user: User, @Ctx() ctx: MyContext){
        if(ctx.req.session.userId === user.id)
            return user.email; 
        return "";
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: MyContext): Promise<User | null> {
        const id = ctx.req.session.userId;
        if (!id) return null;
        const user = await User.findOne({ where: { id } });
        return user;
    }

    @Query(() => [User])
    async users(): Promise<User[]> {
        return await User.find();
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePasswordInput)
        options: UsernamePasswordInput,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
        const hashedPassword = await argon2.hash(options.password);
        let errors: FieldError[] | null;

        errors = preValidateRegister(options);
        if (errors) return { errors };

        let user;
        try {
            user = await User.create({
                username: options.username,
                email: options.email,
                password: hashedPassword,
            }).save();
        } catch (err) {
            errors = postValidateRegister(err);
            if (errors) return { errors };
        }

        ctx.req.session.userId = user?.id;

        return {
            user,
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail", () => String) usernameOrEmail: string,
        @Arg("password", () => String) password: string,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
        const isUsername = !usernameOrEmail.includes("@");

        const user = await User.findOne(
            isUsername
                ? { where: { username: usernameOrEmail } }
                : { where: { email: usernameOrEmail } }
        );

        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message:
                            "could not find the user for the given username/email",
                    },
                ],
            };
        }

        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password",
                    },
                ],
            };
        }

        ctx.req.session!.userId = user.id;

        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() ctx: MyContext): Promise<Boolean> {
        return new Promise((resolve) =>
            ctx.req.session.destroy((err) => {
                if (err) {
                    console.error(err);
                    resolve(false);
                    return;
                }
                ctx.res.clearCookie(COOKIE_NAME);
                resolve(true);
            })
        );
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email", () => String) email: string,
        @Ctx() ctx: MyContext
    ) {
        const user = await User.findOne({ where: { email } });
        if (!user) return true;
        const token = v4();
        await ctx.redis.set(
            CHANGE_PASSWORD_PREFIX + token,
            user.id,
            "EX",
            1000 * 60 * 60 * 2
        );
        const link = `http://localhost:3000/change-password/${token}`;
        await sendEmail(
            email,
            "Forgot Password",
            createChangePasswordEmail(user.username, link)
        );
        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token", () => String) token: string,
        @Arg("newPassword", () => String) newPassword: string,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length < 3) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "password should have at least 3 characters",
                    },
                ],
            };
        }
        const key = CHANGE_PASSWORD_PREFIX + token;
        const userId = (await ctx.redis.get(key)) as string;
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "Your token has expired!",
                    },
                ],
            };
        }
        const userIdNum = parseInt(userId);
        const user = await User.findOne({ where: { id: userIdNum } });
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists",
                    },
                ],
            };
        }

        const newPasswordHashed = await argon2.hash(newPassword);
        User.update({ id: userIdNum }, { password: newPasswordHashed });
        ctx.redis.del(key);
        ctx.req.session.userId = user.id;
        return { user };
    }
}
