import Link from 'next/link'
import SectionTitle from 'components/functional-ui/section-title'
import Widget from 'components/functional-ui/widget'
import { fetchByID, post } from 'helpers/apiService';
import { Component } from 'react';
import moment from 'moment';
import Invoice from 'pages/invoice';

import define from 'src/json/worddefination.json'

export default class InvoiceT extends Component {
    state = {
        order: null
    }

    static getInitialProps({ query }) {
        return query;
    }

    fetchData = async (id) => {

        var data = await fetchByID('orders', id , { noLog: true });
        this.setState(data)
    }

    onChange = async (e, id, status) => {

        let body = {
            id: id,
            status: status
        }

        let order = await post('orders/change-status', body);

        if (order.success) {
            toastr.success('Order Status Update')
        }

        id = this.props.id;
        this.fetchData(id);
    }

    // 
    componentDidMount() {
        let id = this.props.id
        this.fetchData(id);
    }

    print(e) {
        if(screen.width <= 767){
            document.getElementsByClassName('subpage')[0].style.zoom = '100%'
        }
        
        var fileName = this.state.order.order_number
        var element = document.getElementsByClassName('subpage')[0];

        var opt = {
            margin: 0,
            filename: `${fileName}.pdf`,
            image: {
                type: 'jpeg',
                quality: 1
            },
            html2canvas: {
                dpi: 300,
                scale: 1,
            },
            jsPDF: {
                unit: 'mm',
                format: [210, 297],
                orientation: 'portrait'
            },
        };
        html2pdf(element, opt);
        if(screen.width <= 767){
            document.getElementsByClassName('subpage')[0].style.zoom = '60%'
        }
    }

    render() {
        const order = this.state.order
        return (
            <>
                {/* <head >
                    <link rel="stylesheet" href="/website/assets/css/bootstrap.min.css" />

                </head> */}

                <SectionTitle title="Product" subtitle="Order Detail" hideButton={true} />

                <Widget
                    title=""
                    description=''>
                    {order &&
                        <div >

                            <div className="flex flex-row items-center justify-start p-4">

                                <div className="py-2 px-2">
                                    <b>Invoice to:</b>
                                    <p className="">{this.state.order.user.first_name} {this.state.order.user.last_name}</p>
                                    <p className="">Email : {this.state.order.user.email}</p>
                                    <p className="">Mobile Number : {this.state.order.user.mobile_number}</p>

                                </div>
                                <div className="py-2 px-2 ml-auto flex-shrink-0 space-x-2 text-right">
                                    {/* <h5 className="text-eduplus-base"><b>
                                        <Link href="/dashboard/orders/invoice/[id]" as={`/dashboard/orders/invoice/${order.order_number}`}>
                                            <a> View Invoice</a>
                                        </Link>
                                    </b>
                                    </h5> */}
                                    <div className="flex flex-row">
                                        <label className="flex items-center justify-start space-x-2 pr-2">
                                            <input
                                                type="radio"
                                                defaultChecked={order.status == 'SUCCESS'}
                                                key='SUCCESS'
                                                onChange={(e) => this.onChange(e, order.id, 'SUCCESS')}
                                                value="SUCCESS"
                                                name='status'
                                                className={`form-radio h-4 w-4 `}
                                            />
                                            <span
                                                className="">
                                                <b>SUCCESS</b>
                                            </span>
                                        </label>
                                        <label className="flex items-center justify-end space-x-2">
                                            <input
                                                type="radio"
                                                defaultChecked={order.status == 'FAILED'}
                                                key='FAILED'
                                                onChange={(e) => this.onChange(e, order.id, 'FAILED')}
                                                value="FAILED"
                                                name='status'
                                                className={`form-radio h-4 w-4 `}
                                            />
                                            <span
                                                className="">
                                                <b>FAILED</b>
                                            </span>
                                        </label>
                                    </div>


                                    {/* <b>Original for receipt</b>
                                    <h5 className="text-eduplus-base"><b>
                                        <Link href="/dashboard/orders/invoice/[id]" as={`/dashboard/orders/invoice/${order.order_number}`}>
                                            <a> View Invoice</a>
                                        </Link>
                                    </b></h5>
                                    <h5 className="text-eduplus-base"><b>#{this.state.order.order_number}</b></h5>
                                    <p className=""> <b>Date:</b> {moment(this.state.order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</p> */}

                                </div>
                                {/* <div className="ml-auto flex-shrink-0 space-x-2 hidden lg:flex">

</div> */}
                            </div>
                            <hr />
                            <div className="flex flex-row items-center justify-start p-4">
                                <div className="py-2 px-2">
                                    <h5 className="text-eduplus-base"> <b>Transaction Details</b></h5>
                                    <p className=""><b>Pay Via :</b> {this.state.order.pay_via}</p>
                                    {this.state.order.transaction && <>

                                        <p className=""><b>Transaction ID :</b> {this.state.order.transaction.transaction_id}</p>
                                        <p className=""><b>Transaction Status :</b> {this.state.order.transaction.status}</p>
                                        <p className=""><b>Payment Mode :</b> {this.state.order.transaction.payment_mode}</p>
                                        <p className=""><b>Order ID :</b> {this.state.order.transaction.order_id}</p>

                                    </>}</div>

                                <div className="py-2 px-2 ml-auto flex-shrink-0 space-x-2 text-right">
                                    <b>Original for receipt</b>
                                    <h5 className="text-eduplus-base"><b>
                                        <Link href="/dashboard/orders/invoice/[id]" as={`/dashboard/orders/invoice/${order.order_number}`}>
                                            <a> View Invoice</a>
                                        </Link>
                                    </b></h5>
                                    <h5 className="text-eduplus-base"><b>#{this.state.order.order_number}</b></h5>
                                    <p className=""> <b>Date:</b> {moment(this.state.order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</p>
                                    <p className=""> <b>Coupon Applied:</b> {order.coupon ? order.coupon : 'None'}</p>

                                </div>
                                {/* <div className="py-2 px-2 ml-auto flex-shrink-0 space-x-2 text-right">
                                    <b>Original for receipt</b>
                                    <h5 className="text-primary"><b>#{this.state.order.order_number}</b></h5>
                                    <p className=""> <b>Date:</b> {moment(this.state.order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</p>

                                </div> */}
                                {/* <div className="ml-auto flex-shrink-0 space-x-2 hidden lg:flex">

</div> */}
                            </div>
                            <hr />
                            <div className="  items-center  p-4">

                                <h5 className="text-eduplus-base font-bold ">Product List</h5>

                                {this.state.order.carts.map((cart, i) => (
                                    <div className="">
                                        <div class="flex flex-row items-center justify-start p-4">
                                            <div className="justify-start">
                                                <p><b>{cart.product.name}</b></p>
                                                <p className=""><b>Amount Per Quantity : </b> ₹ {cart.amount_per_quantity}</p>
                                                <p className=""><b>Quantity :</b> ₹ {cart.quantity}</p>
                                                <p className=""><b>Amount :</b> ₹ {cart.base_price}</p>
                                                <p className=""><b>Discount :</b> {cart.fixed_discount_amount ? (cart.fixed_discount_type == 'PERCENT' ? `₹ ${cart.finalFixedDiscount}  (${cart.fixed_discount_amount} %)` : `₹ ${cart.fixed_discount_amount}`) : `₹ 0`}</p>
                                                <p className=""><b>Coupon Discount :</b> {cart.discount_amount ? (cart.discount_type == 'PERCENT' ? `₹ ${cart.finalCouponDiscount}  (${cart.discount_amount} % ${cart.discount_amount_upto ? `Upto ₹ ${cart.discount_amount_upto}` : ''})` : `₹ ${cart.discount_amount}`) : `₹ 0`} of Coupon <span className="p-1 border bg-primary text-white">{cart.coupon_code}</span></p>
                                                <p className=""><b>Final Discount :</b> ₹ ${cart.finalDiscount}</p>
                                                <p className=""><b>Tax  :</b>{cart.tax_amount ? (cart.tax_amount_type == 'PERCENT' ? `₹ ${(cart.finalTax)} ( ${cart.tax_amount} %)` : `₹ ${cart.tax_amount}`) : `₹ 0`}</p>
                                                <p className=""><b>Final Amount :</b> <b className="text-eduplus-base">₹ {cart.amount}</b></p>
                                            </div>
                                            <div className="py-2 px-2 ml-auto flex-shrink-0 space-x-2 text-right">
                                                <b></b>
                                                <p><b>Attributes</b></p>
                                                {cart.product.attributes && Object.values(cart.product.attributes).map(attr => {
                                                    return <p className=""><b>{attr.title} :</b> {attr.value}</p>
                                                })}
                                            </div>
                                        </div>

                                        <hr />
                                    </div>
                                ))}

                                <hr />

                                <div className="py-2 px-2 ml-auto ">
                                    <h5> <b className="text-eduplus-base">Final Transaction</b></h5>
                                    <p className=""><b>Base Price</b> : <b>₹ {this.state.order.amount}</b></p>
                                    <p className=""><b> Total Discount</b> : <b>₹ {this.state.order.total_discount}</b></p>
                                    <p className=""><b>Total Tax</b> : <b>₹ {this.state.order.total_tax}</b></p>
                                    <p className=""><b> Shipping Charges</b> : <b>₹ {this.state.order.shipping_charges}</b></p>
                                    <h5 className="text-eduplus-base"> <b>Final Amount</b>:  <b>₹ {this.state.order.final_price}</b></h5>



                                </div>

                            </div>
                        </div>
                    }

                </Widget>




            </>
        )
    }
}
