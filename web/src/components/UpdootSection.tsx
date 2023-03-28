import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import React from "react";
import { PostsQuery, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
    post: PostsQuery["posts"]["posts"][0];
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [, vote] = useVoteMutation();
    return (
        <Box my={2}>
            {/* Left side - vote */}
            <ChevronUpIcon
                color={post.voteStatus > 0 ? "#006900" : ""}
                cursor="pointer"
                onClick={() => vote({ postId: post.id, value: 1 })}
                aria-label="updoot post"
                w={10}
                h={10}
            ></ChevronUpIcon>
            <Box
                textAlign="center"
                fontWeight="600"
                color={post.points === 0 ? "" : post.points > 0 ? "#006900" : "#9b0001"}
            >
                {post.points}
            </Box>
            <ChevronDownIcon
                color={post.voteStatus < 0 ? "#9b0001" : ""}
                cursor="pointer"
                onClick={() => vote({ postId: post.id, value: -1 })}
                aria-label="downdoot post"
                w={10}
                h={10}
            ></ChevronDownIcon>
        </Box>
    );
};

export default UpdootSection;
