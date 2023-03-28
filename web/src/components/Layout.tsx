import NavBar from "./NavBar";
import Wrapper, { WrapperSize } from "./Wrapper";

interface LayoutProps {
    size: WrapperSize;
    children: any;
}

const Layout: React.FC<LayoutProps> = ({ size, children }) => {
    return (
        <>
            <NavBar />
            <Wrapper size={size}>{children}</Wrapper>
        </>
    );
};

export default Layout;
