import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import Layout from "../components/Layout";
import UpdootSection from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 10,
        cursor: null as null | string,
    });
    const [{ data, fetching }] = usePostsQuery({ variables });

    const getDateFormatted = (ms) => new Date(parseInt(ms)).toDateString();

    if (!data && !fetching) return <div> you got no posts right now </div>;

    return (
        <>
            <Layout size="md">
                <Flex alignItems="center" mb={4}>
                    <Heading>LiReddit</Heading>
                    <Box ml="auto">
                        <NextLink href="/create-post">create post</NextLink>
                    </Box>
                </Flex>
                {!data && fetching ? (
                    <div> loading ... </div>
                ) : (
                    <Stack spacing={8}>
                        {data.posts.posts.map((p) => (
                            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
                                <Flex align="center">
                                    <UpdootSection post={p}></UpdootSection>
                                    <Box ml={2}>
                                        {/* Right side - main */}
                                        <Box>
                                            {/* Card Header */}
                                            <Box>
                                                {/* Title and date */}
                                                <Flex align="center">
                                                    <Heading fontSize="xl">{p.title}</Heading>
                                                    <Text ml="auto" fontSize="0.750rem" textColor="#343535">
                                                        {getDateFormatted(p.createdAt)}
                                                    </Text>
                                                </Flex>
                                            </Box>
                                            <Box>
                                                {/* Author */}
                                                <Text fontSize="0.750rem" textColor="#343535">
                                                    posted by {p.creator.username}
                                                </Text>
                                            </Box>
                                        </Box>
                                        <Box>
                                            {/* Text Snippet */}
                                            <Text mt={4}>{p.textSnippet}</Text>
                                        </Box>
                                    </Box>
                                </Flex>
                            </Box>
                        ))}
                    </Stack>
                )}
                {data && data.posts.hasMore ? (
                    <Flex>
                        <Button
                            onClick={() => {
                                setVariables({
                                    limit: variables.limit,
                                    cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                                });
                            }}
                            isLoading={fetching}
                            m="auto"
                            my={8}
                        >
                            more posts
                        </Button>
                    </Flex>
                ) : null}
            </Layout>
        </>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
