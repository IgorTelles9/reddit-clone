import { Post } from "/Users/igortb/Documents/code/practice/lireddit-v2/server/src/entities/Post";
import { Field, InputType, ObjectType } from "type-graphql";
@InputType()
export class PostInput {
    @Field(() => String)
    title: string;

    @Field(() => String)
    text: string;
}

@ObjectType()
export class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field(() => Boolean)
    hasMore: boolean;
}
