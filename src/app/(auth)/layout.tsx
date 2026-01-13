//always return children components
interface Props {
    children: React.ReactNode; //childre of the type of React.ReactNode
}

const Layout = ({ children }: Props) => { //destructure the children prop
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                {children}
            </div>
        </div>
    );
}

export default Layout;