import React from "react";
import { deleteData, edit, post, fetchAll, getSettings } from 'helpers/apiService';
import Router from 'next/router';
import { authGaurd } from 'helpers/auth';
import Razorpay from 'razorpay';

import define from 'src/json/worddefination.json'

export default class Checkout extends React.Component {

    state = {
        amount: 0,
        token: null,
    };

    static getInitialProps({ query }) {
        return query;
    }

    fetchData = async (id) => {

        let userType = await authGaurd()
        let paymentSuccessPage = await getSettings('payment_success_page')

        let order = await fetchAll('payments/status', { orderID: id })

        let thiREF = this;


        if (order) {
            if (order.success == true) {
                if (order.order.items[0]) {
                    let payment = order.order.items[0]

                    if (payment.status == 'captured' && payment.captured == true) {
                        let body = {
                            status: 'SUCCESS',
                            response: payment,
                            order_id: payment.notes.shopping_order_id,
                        }

                        body = await edit('checkout', body, null, thiREF.state.token)

                        // check Response
                        if (body.updated) {
                            toastr.success('Payment Process DONE')

                            if (!userType && thiREF.state.token) {
                                window.location.href = `/payment-response/success/${payment.notes.orderUuid}`;

                                // Router.push(`/payment-response/success/${payment.notes.orderUuid}`)
                            } else {

                                if (paymentSuccessPage == 'YES') {
                                    Router.push(`/payment-response/success/${payment.notes.orderUuid}`)
                                }
                                else {
                                    if (body.order.type == 'MEMBERSHIP') {
                                        Router.push('/accounts/membership-orders')
                                        if (thiREF.props.callBack) {
                                            thiREF.props.callBack()
                                        }
                                    }
                                    else {
                                        Router.push('/accounts/orders')
                                        if (thiREF.props.callBack) {
                                            thiREF.props.callBack()
                                        }
                                    }
                                }
                            }
                            // thiREF.fetchData()
                        }
                        else {
                            let error;
                            if (body.order) {
                                error = body.order.error
                            }
                            else if (body.error) {
                                error = body.error.details ? body.error.details[0].message : body.error
                            }
                            toastr.error(error)
                        }

                    } else {
                        let body = {
                            status: 'FAILED',
                            response: payment,
                            order_id: payment.notes.shopping_order_id,
                        }

                        body = await edit('checkout', body, null, thiREF.state.token)

                        // check Response
                        if (body.updated) {
                            toastr.error('Payment Failed')
                            if (!userType && thiREF.state.token) {
                                window.location.href = `/payment-response/failed/${payment.notes.orderUuid}`;
                                // Router.push(`/payment-response/failed/${payment.notes.orderUuid}`)
                            }

                            else {
                                if (paymentSuccessPage == 'YES') {
                                    Router.push(`/payment-response/failed/${payment.notes.orderUuid}`)
                                }
                                else {
                                    Router.push('/accounts/orders')
                                    if (thiREF.props.callBack) {
                                        thiREF.props.callBack()
                                    }
                                }
                            }
                            // thiREF.fetchData()
                            // resetForm();
                        }
                        else {
                            let error;
                            if (body.order) {
                                error = body.order.error
                            }
                            else if (body.error) {
                                error = body.error.details[0].message
                            }
                            toastr.error(error)
                        }
                    }
                }
            }
        }

    }

    // 
    componentDidMount() {

        if (this.props.token) {

            this.setState({
                token: this.props.token
            })
        }
        let id = this.props.order_id
        this.fetchData(id);
    }

    render() {
        return (<>
            <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden opacity-75 flex items-center justify-center">
                <img className="w-custom" src="/images/loader.gif" />
            </div>

        </>)
    }
}