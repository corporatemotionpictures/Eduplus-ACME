import React from "react";
import { deleteData, edit, post, fetchAll, add, getSettings } from 'helpers/apiService';
import Router from 'next/router';
import { authGaurd } from 'helpers/auth';
import define from 'src/json/worddefination.json'
import moment from 'moment'

export default class Checkout extends React.Component {

    state = {
        amount: 0,
        token: null,
        product_id: null,
        cart_id: null,
        type: "cartPayment"
    };

    static getInitialProps({ query }) {
        return query;
    }

    checkout = async () => {
        // e.preventDefault()

        let query = {

            cart_id: this.state.cart_id,
            type: this.state.type,
        }

        if (this.props.paymentType) {
            query.paymentType = this.props.paymentType
        }

        if (this.props.addressID) {
            query.addressID = this.props.addressID
        }

        let data = await fetchAll('checkout', query, this.props.token)

        const thiREF = this
        if (data.success == true) {
            if (data.options) {
                data.options.handler = async function (response) {
                    let userType = await authGaurd()
                    let paymentSuccessPage = await getSettings('payment_success_page')

                    let order = await fetchAll('payments/status', { orderID: data.options.order_id })

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

                                        let productName = ''

                                        data.products.map(product => {
                                            productName = `${productName}, ${product}`
                                        })

                                        productName = `Thank you for purchasing ${productName}`

                                        let notification = {
                                            title: `Thank you for your order! 🎉`,
                                            body: `${productName}`,
                                            onlyOneUser: true,
                                            action: 'OrderList'
                                        };


                                        let pushNotification = await add('push-notifications', notification);

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
                                }
                                else {
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

                data.options.modal = {
                    "ondismiss": async function () {
                        let update = await post('carts/payment-initiation', {
                            'payment_initiated_on': moment().format('MMMM Do YYYY, h:mm:ss a')
                        }, thiREF.state.token)
                    }
                }


                let rzp = new Razorpay(data.options);
                rzp.open();

                // rzp.on('payment.failed', async function (response) {

                //     let body = {
                //         status: 'FAILED',
                //         response: response,
                //         order_id: data.order_number,
                //     }

                //     body = await edit('checkout', body, null, thiREF.state.token)

                //     // check Response
                //     if (body.updated) {
                //         toastr.error('Payment Failed')
                //         if (thiREF.state.token) {
                //             window.location.href = `/payment-response/failed/${body.order.uuid}`;
                //             // Router.push(`/payment-response/failed/${body.order.uuid}`)
                //         }

                //         else {
                //             Router.push('/accounts/orders')
                //             if (thiREF.props.callBack) {
                //                 thiREF.props.callBack()
                //             }
                //         }
                //         // thiREF.fetchData()
                //         // resetForm();
                //     }
                //     else {
                //         let error;
                //         if (body.order) {
                //             error = body.order.error
                //         }
                //         else if (body.error) {
                //             error = body.error.details[0].message
                //         }
                //         toastr.error(error)
                //     }
                // })}
            } else if (data.amount == 0) {
                let body = {
                    status: 'SUCCESS',
                    response: {},
                    order_id: data.order_number,
                }

                body = await edit('checkout', body, null, thiREF.state.token)

                // check Response
                if (body.updated) {
                    toastr.success('Payment Process DONE')

                    let productName = ''

                    data.products.map(product => {
                        productName = `${productName}, ${product}`
                    })

                    productName = `Thank you for purchasing ${productName}`

                    let notification = {
                        title: `Thank you for your order! 🎉`,
                        body: `${productName}`,
                        onlyOneUser: true,
                        action: 'OrderList'
                    };


                    let pushNotification = await add('push-notifications', notification);

                    if (thiREF.state.token) {
                        window.location.href = `/payment-response/success/${body.order.uuid}`;

                        // Router.push(`/payment-response/success/${body.order.uuid}`)
                    } else {

                        if (thiREF.props.paymentType && thiREF.props.paymentType == 'MEMBERSHIP') {
                            Router.push('/accounts/membership-orders')
                            if (thiREF.props.callBack) {
                                thiREF.props.callBack()
                            }
                        } else {

                            Router.push('/accounts/orders')
                            if (thiREF.props.callBack) {
                                thiREF.props.callBack()
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
            }
        }



        //  Router.push('/payment');
    }

    componentDidMount() {

        if (this.props.token) {

            this.setState({
                token: this.props.token
            })
        }

        if (this.props.cart_id) {
            this.setState({
                cart_id: this.props.cart_id,
                type: "buyNow",
            })
        }

        if (this.props.type) {
            this.setState({
                type: this.props.type,
            })
        }

        this.checkout()

    }



    render() {
        return (

            <div>
            </div >
        )
    }
}

