import { Children, Component } from 'react';
import Text from 'components/functional-ui/login/text'
import Logo from 'components/functional-ui/login/logo'
import Footer from 'components/functional-ui/login/footer'
import Alert from 'components/functional-ui/alerts'
import { FiAlertCircle } from 'react-icons/fi'


export default class Login extends Component {

    render() {

        return (
            <>

                <div className="w-full flex flex-row h-screen overflow-hidden">
                    <div className="hidden lg:flex lg:flex-col w-1/2 text-white p-16 items-start justify-between relative bg-login-2 ">
                        <Logo />
                        <Text />
                        <Footer />
                    </div>
                    <div className="w-full lg:w-1/2 bg-white p-8 lg:px-24 lg:pb-12 lg:pt-44 flex flex-col items-start justify-end lg:justify-center bg-login-mobile">
                    <Logo  className=" flex lg:hidden w-1/3 absolute top-4"/>
                        <p className="text-2xl font-bold text-base mb-2 lg:mb-4">
                            {this.props.title} <span className="text-eduplus-base"> {this.props.mainTitle}</span>
                        </p>
                        {this.props.error && (
                            <div className="w-full mb-4">
                                <Alert
                                    color="bg-base text-white"
                                    icon={<FiAlertCircle className="mr-2 stroke-current h-4 w-4" />}>
                                    {this.props.error}
                                </Alert>
                            </div>
                        )}

                        {this.props.children}
                    </div>
                </div>

            </>
        )
    }

}   