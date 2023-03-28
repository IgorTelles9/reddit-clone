import { Box, Button, Flex } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();
    return (
        <Wrapper size="sm">
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    await forgotPassword(values);
                    setComplete(true);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        {complete ? (
                            <>
                                <Box mt={4} textAlign="center" textColor="teal">
                                    Check your mailbox. If there's nothing
                                    there, we couldn't find an account with this
                                    email address.
                                </Box>
                                <Flex >
                                    <Box ml="auto" mr="auto">
                                        <NextLink href="/">
                                            <Button
                                                mt={4}
                                                type="button"
                                                colorScheme="teal"
                                                size="sm"
                                            >
                                                back to home
                                            </Button>
                                        </NextLink>
                                    </Box>
                                </Flex>
                            </>
                        ) : (
                            <>
                                <InputField
                                    name="email"
                                    placeholder="email"
                                    label="What's your registered email?"
                                    type="email"
                                ></InputField>
                                <Button
                                    mt={4}
                                    isLoading={isSubmitting}
                                    type="submit"
                                    colorScheme="teal"
                                >
                                    submit
                                </Button>
                            </>
                        )}
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
