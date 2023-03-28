import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery, usePostsQuery } from "../generated/graphql";
import { useRouter } from "next/router";

interface NavBarProps {}

const Register: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [isServer, setIsServer] = useState(true);
    useEffect(() => setIsServer(false), []);
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery({
        pause: isServer,
    });
    let body = null;
    if (!fetching) {
        if (!data?.me) {
            body = (
                <>
                    <Flex>
                        <Box mr={2}>
                            <NextLink href="/login">login</NextLink>
                        </Box>
                        <Box mr={2}>
                            <NextLink href="/register">register</NextLink>
                        </Box>
                    </Flex>
                </>
            );
        } else {
            body = (
                <>
                    <Flex>
                        <Box mr={2}> {data.me.username}</Box>
                        <Button
                            onClick={() => {
                                logout(null);
                            }}
                            isLoading={logoutFetching}
                            variant="link"
                        >
                            logout
                        </Button>
                    </Flex>
                </>
            );
        }
    }
    return (
        <Flex zIndex={2} position="sticky" alignItems="center" bg="tan">
            {router.pathname !== "/" ? (
                <Box fontSize="2rem" fontWeight="500" m={2}>
                    <NextLink href="/">LiReddit</NextLink>
                </Box>
            ) : null}
            <Box m={4} ml="auto">
                {body}
            </Box>
        </Flex>
    );
};
export default Register;
