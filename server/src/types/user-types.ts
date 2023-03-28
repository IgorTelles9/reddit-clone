import { InputType, Field, ObjectType } from "type-graphql";
import { FieldError } from "./error-types";
import { User } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/entities/User";

@InputType()
export class UsernamePasswordInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    email: string;

    @Field(() => String)
    password: string;
}

@ObjectType()
export class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}
