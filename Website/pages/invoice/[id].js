import { FiBox } from 'react-icons/fi'
import SectionTitle from 'components/functional-ui/section-title'
import Widget from 'components/functional-ui/widget'
import { fetchByID, getSettings } from 'helpers/apiService';
import { Component } from 'react';
import moment from 'moment';
import Link from 'next/link';

import define from 'src/json/worddefination.json'

export default class Invoice extends Component {
    state = {
        order: null,
        appData: null
    }

    static getInitialProps({ query }) {
        return query;
    }

    fetchData = async (id) => {

        var data = await fetchByID('orders', id, {}, this.props.token);
        this.setState(data)

        data = await getSettings('metaDetails')
        this.setState({
            appData: data
        })
        data = await getSettings('invoiceDetails')
        this.setState({
            invoiceDetails: data
        })
    }

    loadScript = (filename, callback) => {
        var fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.onload = callback;
        fileref.setAttribute("src", filename);
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref)
        }
    }

    // 
    componentDidMount() {

        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js')
        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js')
        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.8.1/html2pdf.js')
        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.8.1/html2pdf.bundle.js')

        let id = this.props.id
        this.fetchData(id);
    }

    print(e) {

        e.preventDefault()
        if (screen.width <= 767) {
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

        if (screen.width <= 767) {
            document.getElementsByClassName('subpage')[0].style.zoom = '60%'
        }
    }

    render() {
        return (
            <>
                <div>
                    
                    <div className="container mb-5 mt-2">
                        <button onClick={(e) => this.print(e)} className="btn btn-primary float-right">Save As PDF</button>
                    </div>
                    {
                        this.state.order &&
                        <div className="p-4 mt-5 container subpage">

                            <div className="row pb-3">

                                <div className="col-5">
                                    {this.state.appData && <img src={this.state.appData.logoDark} className="stroke-current text-base w-50"></img>}
                                </div>
                                <div className="col-7 float-right text-right">
                                    <b>Original for receipt</b>
                                    <h5 className="text-primary"><b>#{this.state.order.order_number}</b></h5>
                                    <p className="text-gray-500"> <b>Date:</b> {moment(this.state.order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</p>

                                </div>
                            </div>
                            <hr />
                            <div className="row py-3">
                                <div className="col-6">
                                    <b>Invoice to:</b>
                                    <p className="text-gray-500">{this.state.order.user.first_name} {this.state.order.user.last_name}</p>
                                    <p className="text-gray-500">Email : {this.state.order.user.email}</p>
                                    <p className="text-gray-500">Mobile Number : {this.state.order.user.mobile_number}</p>
                                    {
                                        <p className="text-gray-500">Address : {this.state.order.address ? `${this.state.order.address},` : ''}  {this.state.order.city ? `${this.state.order.city},` : ''}    {this.state.order.state}  {this.state.order.zip_code}, {this.state.order.country}</p>
                                    }

                                    {this.state.invoiceDetails && this.state.invoiceDetails.invoiceFrom && this.state.invoiceDetails.invoiceFrom == 'SHOW' &&
                                        <div className="mt-2">

                                            <b>Invoice From:</b>
                                            {this.state.invoiceDetails.invoiceFromName && <p className=" text-primary"><b>{this.state.invoiceDetails.invoiceFromName}</b></p>}
                                            {this.state.invoiceDetails.invoiceFromEmail && <p className="text-gray-500">Email : {this.state.invoiceDetails.invoiceFromEmail}</p>}
                                            {this.state.invoiceDetails.invoiceFromMobile && <p className="text-gray-500">Mobile Number : {this.state.invoiceDetails.invoiceFromMobile}</p>}
                                            {this.state.invoiceDetails.invoiceFromGST && <p className="text-gray-500">GST : {this.state.invoiceDetails.invoiceFromGST}</p>}
                                            {
                                                this.state.invoiceDetails.invoiceFromAddress && <p className="text-gray-500">Address : {this.state.invoiceDetails.invoiceFromAddress}</p>
                                            }
                                        </div>
                                    }

                                </div>
                                <div className="col-6 text-right float-right">
                                    <b>Payment Detail:</b>

                                    <p className="text-gray-500">Pay Via : {this.state.order.pay_via}</p>
                                    <p className="text-gray-500">Transaction ID : {this.state.order.transaction ? this.state.order.transaction.transaction_id : ''}</p>
                                    <p className="text-gray-500">Transaction Status : {this.state.order.transaction ? this.state.order.transaction.status : ''}</p>
                                    <p className="text-gray-500">Payment Mode : {this.state.order.transaction ? this.state.order.transaction.payment_mode : ''}</p>
                                    {/* <p className="text-gray-500">Order ID : {this.state.order.transaction ? this.state.order.transaction.order_id : ''}</p> */}
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead className="
">
                                        <tr>
                                            <th className="">
                                                Product
                                            </th>
                                            {/* <th className="text-right">
                                                Base Amount
                                            </th>

                                            <th className="text-right">
                                                Quantity
                                            </th> */}
                                            <th className="text-right">
                                                Base Price
                                            </th>
                                            {this.state.order.total_membership_discount > 0 && <th className="text-right">
                                                Membership Discount
                                            </th>}
                                            { <th className="text-right">
                                                Discount
                                            </th>}
                                            {<th className="text-right">
                                                Coupon Discount
                                            </th>}
                                            {<th className="text-right">
                                                Referral Discount
                                            </th>}
                                            <th className="text-right">
                                                Final Discount
                                            </th>
                                            <th className="text-right">
                                                Shipping Charge
                                            </th>
                                            <th className="text-right">
                                                Tax Included
                                            </th>

                                            <th className="text-right">
                                                Final Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.order.carts.map((cart, i) => (
                                            <tr key={i}>
                                                <td className="pr-3 py-2  ">
                                                    {this.state.order.type == 'PRODUCT' && <span>

                                                        <b className="mb-2"> {cart.product.name}</b>
                                                        {cart.product.attributes && Object.values(cart.product.attributes).map(attr => {
                                                            if (!attr.hidden) {
                                                                return <p className=" mb-0">{attr.title} : {attr.value}</p>
                                                            }
                                                        })}
                                                    </span>}
                                                    {this.state.order.type == 'MEMBERSHIP' && <span>

                                                        <b className="mb-2"> {cart.membership.title}</b>
                                                        <p className=" mb-0">{cart.membership.validity ? cart.membership.validity.title : ''}</p>
                                                    </span>}
                                                </td>
                                                {/* <td className="px-3 py-2  text-right">
                                                    ₹ {cart.amount_per_quantity}
                                                    {`${cart.tax_included_in_base_price ? '(Tax Included)' : ''}`}
                                                </td>
                                                <td className="px-3 py-2  text-right">{cart.quantity}</td> */}
                                                <td className="px-3 py-2  text-right" >
                                                    ₹ {cart.base_price}
                                                    {`${cart.tax_included_in_base_price ? ' (Tax Included)' : ''}`}
                                                    <br />
                                                    {cart.quantity && cart.quantity != 1 && `Quantity : ${cart.quantity}`}
                                                    <br />
                                                    {cart.quantity && cart.quantity != 1 && `Base Amount : ${cart.amount_per_quantity}`}

                                                </td>

                                                {/* <td className="px-3 py-2  text-right">{cart.quantity}</td> */}
                                                {this.state.order.total_membership_discount > 0 && <td className="px-3 py-2  text-right">
                                                    {`₹ ${cart.finalmembershipDiscount}`}
                                                </td>}
                                                { <td className="px-3 py-2  text-right">
                                                    {cart.fixed_discount_amount ? (cart.fixed_discount_type == 'PERCENT' ? `₹ ${cart.finalFixedDiscount}  (${cart.fixed_discount_amount} %)` : `₹ ${cart.fixed_discount_amount}`) : `₹ 0`}
                                                </td>}
                                                {<td className="px-3 py-2  text-right">
                                                    {cart.discount_amount ? (cart.discount_type == 'PERCENT' ? `₹ ${cart.finalCouponDiscount}  (${cart.discount_amount} % ${cart.discount_amount_upto ? `Upto ₹ ${cart.discount_amount_upto}` : ''})` : `₹ ${cart.discount_amount}`) : `₹ 0`}
                                                    <br />
                                                    {cart.coupon_code && <span className="p-1 border bg-primary text-white mt-1">{cart.coupon_code}</span>}
                                                </td>}
                                                {<td className="px-3 py-2  text-right">
                                                    {cart.referral_amount ? (cart.referral_discount_type == 'PERCENT' ? `₹ ${cart.finalReferralDiscount}  (${cart.referral_amount} % ${cart.referral_discount_amount_upto ? `Upto ₹ ${cart.referral_discount_amount_upto}` : ''})` : `₹ ${cart.referral_amount}`) : `₹ 0`}
                                                    <br />
                                                    {cart.referral_code && <span className="p-1 ml-1 border bg-primary text-white mt-2">{cart.referral_code}</span>}
                                                </td>}
                                                <td className="px-3 py-2  text-right">
                                                    ₹ {cart.finalDiscount}
                                                </td>
                                                <td className="px-3 py-2  text-right">
                                                    ₹ {cart.shipping_charge}
                                                </td>
                                                <td className="px-3 py-2  text-right">{cart.tax_amount ? (cart.tax_amount_type == 'PERCENT' ? `₹ ${(cart.finalTax)}  ( ${cart.tax_amount} %)` : `₹ ${cart.tax_amount}`) : `₹ 0`}</td>
                                                <td className="pl-3 py-2  text-right">
                                                    ₹ {cart.amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="row">
                                <div className="col-7">

                                    {this.state.invoiceDetails && this.state.invoiceDetails.TermsAndCondition && JSON.parse(this.state.invoiceDetails.TermsAndCondition) && JSON.parse(this.state.invoiceDetails.TermsAndCondition).length > 0 && <div>

                                        <h5>Terms & Conditions</h5>
                                        <ul className="p-2">
                                            {
                                                JSON.parse(this.state.invoiceDetails.TermsAndCondition).map((terms, i) => {
                                                    return <li>{i + 1}. {terms.TermsAndCondition}</li>
                                                })
                                            }
                                        </ul>
                                    </div>}

                                </div>
                                <div className="col-5">
                                    <div className="row text-right float-right">
                                        <div className="col-6">
                                            <b>Base Price</b>
                                        </div>
                                        <div className="col-6">
                                            <b>₹ {this.state.order.amount}</b>
                                        </div>
                                        <div className="col-6">
                                            <b> Refferar Discount</b>
                                        </div>
                                        <div className="col-6">
                                            <b>₹ {this.state.order.referrar_discount}</b>
                                        </div>
                                        <div className="col-6">
                                            <b> Discount</b>
                                        </div>
                                        <div className="col-6">
                                            <b>₹ {this.state.order.total_discount}</b>
                                        </div>
                                        <div className="col-6">
                                            <b>Total Tax</b>
                                        </div>
                                        <div className="col-6">
                                            <b>₹ {this.state.order.total_tax}</b>
                                        </div>
                                        {/* <div className="col-6">
                                            <b> Shipping Charges</b>
                                        </div>
                                        <div className="col-6">
                                            <b>₹ {this.state.order.shipping_charges}</b>
                                        </div> */}
                                        <div className="col-6">
                                            <h5 className="text-primary"><b>Final Amount</b></h5>
                                        </div>
                                        <div className="col-6">
                                            <h5 className="text-primary"> <b>₹ {this.state.order.final_price}</b></h5>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            {this.state.invoiceDetails && this.state.invoiceDetails.endMsg && <div className="text-center border p-2 mt-4">{this.state.invoiceDetails.endMsg}</div>}
                        </div>
                    } </div>
            </>
        )
    }
}
