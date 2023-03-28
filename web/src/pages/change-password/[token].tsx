import { Box, Button, Flex } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import NextLink from "next/link";

const ChangePassword: NextPage = () => {
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState("");
    return (
        <Wrapper size="sm">
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        newPassword: values.newPassword,
                        token:
                            typeof router.query === "string"
                                ? router.query
                                : "",
                    });
                    if (response.data?.changePassword.errors) {
                        const errors = toErrorMap(
                            response.data.changePassword.errors
                        );
                        if ("token" in errors) setTokenError(errors.token);
                        setErrors(errors);
                    } else if (response.data.changePassword.user) {
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="newPassword"
                            placeholder="new password"
                            label="Choose a new password"
                            type="password"
                        ></InputField>
                        {tokenError ? (
                            <Flex>
                                <Box
                                    textColor="#E53E3E"
                                    mt={2}
                                    fontSize="0.875rem"
                                >
                                    {tokenError}
                                </Box>
                                <NextLink href="/forgot-password">
                                    <Box
                                        textColor="#E53E3E"
                                        ml={1}
                                        mt={2}
                                        fontSize="0.875rem"
                                    >
                                        Click here to get a new link.
                                    </Box>
                                </NextLink>
                            </Flex>
                        ) : (
                            <></>
                        )}
                        <Button
                            mt={4}
                            isLoading={isSubmitting}
                            type="submit"
                            colorScheme="teal"
                        >
                            Change Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword);
