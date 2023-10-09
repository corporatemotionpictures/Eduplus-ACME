import { FiBox } from 'react-icons/fi'
import SectionTitle from 'components/functional-ui/section-title'
import Widget from 'components/functional-ui/widget'
import { fetchByID, getSettings } from 'helpers/apiService';
import { Component } from 'react';
import moment from 'moment';
import { UnderlinedTabs, VerticalTabs } from 'components/functional-ui/tabs'

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

        var data = await fetchByID('orders', id);
        this.setState(data)

        data = await getSettings('invoiceDetails')
        this.setState({
            invoiceDetails: data
        })

        data = await getSettings('metaDetails')
        this.setState({
            appData: data
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
        document.getElementsByClassName('subpage')[0].style.zoom = '100%'
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

        let tabs = [
            {
                index: 0,
                title: 'Invoice',
                content: (
                    <div className="container  ">

                        <div className=" mb-5">
                            <button onClick={(e) => this.print(e)} className="bg-base text-white mb-4 p-2 float-right">Print As PDF</button>
                        </div>
                        {
                            this.state.order &&
                            <div className="p-4 mt-5  subpage">

                                <div className="flex flex-row flex-wrap pb-3 w-full pb-3">

                                    <div className="w-1/3">
                                        {this.state.appData && <img src={this.state.appData.logoDark} className="stroke-current text-base"></img>}
                                    </div>
                                    <div className="w-2/3 float-right text-right">
                                        <b>Original for receipt</b>
                                        <h5 className="text-blue-500"><b>#{this.state.order.order_number}</b></h5>
                                        <p className=" mb-0"> <b>Date:</b> {moment(this.state.order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</p>

                                    </div>
                                </div>
                                <hr />
                                <div className="flex flex-row flex-wrap pb-3 w-full py-4">
                                    <div className="w-1/2">
                                        <b>Ship to:</b>
                                        <p className=" mb-0">{this.state.order.user.first_name} {this.state.order.user.last_name}</p>
                                        <p className=" mb-0">Email : {this.state.order.user.email}</p>
                                        <p className=" mb-0">Mobile Number : {this.state.order.user.mobile_number}</p>
                                        {
                                            <p className=" mb-0">Address : Address : {this.state.order.address ? `${this.state.order.address},` : ''}  {this.state.order.city ? `${this.state.order.city},` : ''}    {this.state.order.state}  {this.state.order.zip_code}, {this.state.order.country}</p>
                                        }

                                        {this.state.invoiceDetails && this.state.invoiceDetails.invoiceFrom && this.state.invoiceDetails.invoiceFrom == 'SHOW' &&
                                            <div className="mt-2">

                                                <b>Invoice From:</b>
                                                {this.state.invoiceDetails.invoiceFromName && <p className="text-blue-500 mb-0 text-bold font-bold">{this.state.invoiceDetails.invoiceFromName}</p>}
                                                {this.state.invoiceDetails.invoiceFromEmail && <p className=" mb-0">Email : {this.state.invoiceDetails.invoiceFromEmail}</p>}
                                                {this.state.invoiceDetails.invoiceFromMobile && <p className=" mb-0">Mobile Number : {this.state.invoiceDetails.invoiceFromMobile}</p>}
                                                {this.state.invoiceDetails.invoiceFromGST && <p className=" mb-0">GST : {this.state.invoiceDetails.invoiceFromGST}</p>}
                                                {
                                                    this.state.invoiceDetails.invoiceFromAddress && <p className=" mb-0">Address : {this.state.invoiceDetails.invoiceFromAddress}</p>
                                                }
                                            </div>
                                        }

                                    </div>
                                    <div className="w-1/2 text-right float-right">
                                        <b>Payment Detail:</b>

                                        <p className=" mb-0">Pay Via : {this.state.order.pay_via}</p>
                                        <p className=" mb-0">Transaction ID : {this.state.order.transaction ? this.state.order.transaction.transaction_id : ''}</p>
                                        <p className=" mb-0">Transaction Status : {this.state.order.transaction ? this.state.order.transaction.status : ''}</p>
                                        <p className=" mb-0">Payment Mode : {this.state.order.transaction ? this.state.order.transaction.payment_mode : ''}</p>
                                        {/* <p className=" mb-0">Order ID : {this.state.order.transaction ? this.state.order.transaction.order_id : ''}</p> */}
                                    </div>
                                </div>
                                <div className="table-responsive overflow-x-scroll w-full border-t pt-2">
                                    <table className="table table-striped w-full">
                                        <thead className="
">
                                            <tr>
                                                <th className="">
                                                    Product
                                                </th>
                                                <th className="text-right">
                                                    Base Amount
                                                </th>
                                                {/* <th className="text-right">
                                                Quantity
                                        </th>
                                            <th className="text-right">
                                                Amount
                                        </th> */}
                                                {this.state.order.total_membership_discount > 0 && <th className="text-right">
                                                    Membership Discount
                                                </th>}
                                                {<th className="text-right">
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
                                                    <td className="pr-3 py-2 whitespace-normal ">
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
                                                    {/* <td className="px-3 py-2 whitespace-normal text-right">
                                                    ₹ {cart.amount_per_quantity}
                                                    {`${cart.tax_included_in_base_price ? '(Tax Included)' : ''}`}
                                                </td>
                                                <td className="px-3 py-2 whitespace-normal text-right">{cart.quantity}</td> */}
                                                    <td className="px-3 py-2 whitespace-normal text-right">
                                                        ₹ {cart.base_price}
                                                        {`${cart.tax_included_in_base_price ? '(Tax Included)' : ''}`}
                                                        <br />
                                                        {cart.quantity != 1 && `Quantity : ${cart.quantity}`}
                                                        <br />
                                                        {cart.quantity != 1 && `Base Amount : ${cart.amount_per_quantity}`}
                                                    </td>
                                                    {this.state.order.total_membership_discount > 0 && <td className="px-3 py-2  text-right whitespace-normal">
                                                        {`₹ ${cart.finalmembershipDiscount}`}
                                                    </td>}
                                                    {<td className="px-3 py-2 whitespace-normal  text-right">
                                                        {cart.fixed_discount_amount ? (cart.fixed_discount_type == 'PERCENT' ? `₹ ${cart.finalFixedDiscount}  (${cart.fixed_discount_amount} %)` : `₹ ${cart.fixed_discount_amount}`) : `₹ 0`}
                                                    </td>}
                                                    {<td className="px-3 py-2 whitespace-normal text-right">
                                                        {cart.discount_amount ? (cart.discount_type == 'PERCENT' ? `₹ ${cart.finalCouponDiscount}  (${cart.discount_amount} % ${cart.discount_amount_upto ? `Upto ₹ ${cart.discount_amount_upto}` : ''})` : `₹ ${cart.discount_amount}`) : `₹ 0`}
                                                        <br />
                                                        {cart.coupon_code && <span className="p-1 border bg-primary text-white ">{cart.coupon_code}</span>}
                                                    </td>}
                                                    {<td className="px-3 py-2 whitespace-normal  text-right">
                                                        {cart.referral_amount ? (cart.referral_discount_type == 'PERCENT' ? `₹ ${cart.finalReferralDiscount}  (${cart.referral_amount} % ${cart.referral_discount_amount_upto ? `Upto ₹ ${cart.referral_discount_amount_upto}` : ''})` : `₹ ${cart.referral_amount}`) : `₹ 0`}
                                                        <br />
                                                        {cart.referral_code && <span className="p-1 ml-1 border bg-primary text-white">{cart.referral_code}</span>}
                                                    </td>}
                                                    <td className="px-3 py-2 whitespace-normal text-right">
                                                        ₹ {cart.finalDiscount}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-normal text-right">
                                                        ₹ {cart.shipping_charge}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-normal text-right">{cart.tax_amount ? (cart.tax_amount_type == 'PERCENT' ? `₹ ${(cart.finalTax)} ( ${cart.tax_amount} %)` : `₹ ${cart.tax_amount}`) : `₹ 0`}</td>
                                                    <td className="pl-3 py-2 whitespace-normal text-right">
                                                        ₹ {cart.amount}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex flex-row flex-wrap pb-3 w-full mt-4 pl-2">
                                    <div className="w-2/4 ">

                                        {this.state.invoiceDetails && this.state.invoiceDetails.TermsAndCondition && JSON.parse(this.state.invoiceDetails.TermsAndCondition) && JSON.parse(this.state.invoiceDetails.TermsAndCondition).length > 0 && <div>

                                            <p><b>Terms & Conditions</b></p>
                                            <ul className="p-2">
                                                {
                                                    JSON.parse(this.state.invoiceDetails.TermsAndCondition).map((terms, i) => {
                                                        return <li>{i + 1}. {terms.TermsAndCondition}</li>
                                                    })
                                                }
                                            </ul>
                                        </div>}
                                    </div>
                                    <div className="w-2/4">
                                        <div className="flex flex-row flex-wrap pb-3 w-full text-right float-right">
                                            <div className="w-1/2">
                                                <b>Base Price</b>
                                            </div>
                                            <div className="w-1/2">
                                                <b>₹ {this.state.order.amount}</b>
                                            </div>
                                            <div className="w-1/2">
                                                <b>Referrar Discount</b>
                                            </div>
                                            <div className="w-1/2">
                                                <b>₹ {this.state.order.referrar_discount}</b>
                                            </div>
                                            <div className="w-1/2">
                                                <b> Discount</b>
                                            </div>
                                            <div className="w-1/2">
                                                <b>₹ {this.state.order.total_discount}</b>
                                            </div>
                                            <div className="w-1/2">
                                                <b>Total Tax</b>
                                            </div>
                                            <div className="w-1/2">
                                                <b>₹ {this.state.order.total_tax}</b>
                                            </div>
                                            <div className="w-1/2">
                                                <h5 className="text-blue-500"><b>Final Amount</b></h5>
                                            </div>
                                            <div className="w-1/2">
                                                <h5 className="text-blue-500"> <b>₹ {this.state.order.final_price}</b></h5>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                {this.state.invoiceDetails && this.state.invoiceDetails.endMsg && <div className="text-center border p-2 mt-4">{this.state.invoiceDetails.endMsg}</div>}

                            </div>
                        }
                    </div>
                )
            },
            {
                index: 1,
                title: 'Invoice Without Amount',
                content: (
                    <div className="container  ">

                        <div className=" mb-5">
                            <button onClick={(e) => this.print(e)} className="bg-base text-white mb-4 p-2 float-right">Print As PDF</button>
                        </div>
                        {
                            this.state.order &&
                            <div className="p-4 mt-5  subpage">

                                <div className="flex flex-row flex-wrap pb-3 w-full pb-3">

                                    <div className="w-1/3">
                                        {this.state.appData && <img src={this.state.appData.logoDark} className="stroke-current text-base"></img>}
                                    </div>
                                    <div className="w-2/3 float-right text-right">
                                        <b>Original for receipt</b>
                                        <h5 className="text-blue-500"><b>#{this.state.order.order_number}</b></h5>
                                        <p className=" mb-0"> <b>Date:</b> {moment(this.state.order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</p>

                                    </div>
                                </div>
                                <hr />
                                <div className="flex flex-row flex-wrap pb-3 w-full py-4">
                                    <div className="w-1/2">
                                        <b>Ship to:</b>
                                        <p className=" mb-0">{this.state.order.user.first_name} {this.state.order.user.last_name}</p>
                                        <p className=" mb-0">Email : {this.state.order.user.email}</p>
                                        <p className=" mb-0">Mobile Number : {this.state.order.user.mobile_number}</p>
                                        {
                                            this.state.order.address && <p className=" mb-0">Address : {this.state.order.address},  {this.state.order.city},  {this.state.order.state}  {this.state.order.zip_code}, {this.state.order.country}</p>
                                        }



                                    </div>
                                    <div className="w-1/2 mb-4 text-right float-right">

                                        <p><b>Payment Status</b></p>

                                        <p className=" mb-0">Pay Via : {this.state.order.pay_via}</p>
                                        <p className=" mb-0">Transaction ID : {this.state.order.transaction ? this.state.order.transaction.transaction_id : ''}</p>
                                        <p className=" mb-0">Transaction Status : {this.state.order.transaction ? this.state.order.transaction.status : ''}</p>
                                        <p className=" mb-0">Payment Mode : {this.state.order.transaction ? this.state.order.transaction.payment_mode : ''}</p>
                                        {/* <p className=" mb-0">Order ID : {this.state.order.transaction ? this.state.order.transaction.order_id : ''}</p> */}

                                    </div>

                                    <div className="w-full">

                                        {this.state.invoiceDetails && this.state.invoiceDetails.invoiceFrom && this.state.invoiceDetails.invoiceFrom == 'SHOW' &&
                                            <div className="mt-2">

                                                <b>If the address is not found then kindly return this item to:</b>
                                                {this.state.invoiceDetails.invoiceFromName && <p className="text-blue-500 mb-0 text-bold font-bold">{this.state.invoiceDetails.invoiceFromName}</p>}
                                                {this.state.invoiceDetails.invoiceFromEmail && <p className=" mb-0">Email : {this.state.invoiceDetails.invoiceFromEmail}</p>}
                                                {this.state.invoiceDetails.invoiceFromMobile && <p className=" mb-0">Mobile Number : {this.state.invoiceDetails.invoiceFromMobile}</p>}
                                                {this.state.invoiceDetails.invoiceFromGST && <p className=" mb-0">GST : {this.state.invoiceDetails.invoiceFromGST}</p>}
                                                {
                                                    this.state.invoiceDetails.invoiceFromAddress && <p className=" mb-0">Address : {this.state.invoiceDetails.invoiceFromAddress}</p>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>



                                <hr className="my-2" />
                                <b className="my-2">Product Details</b>
                                <hr className="my-2" />

                                <div className="flex flex-row flex-wrap pb-3 w-full mt-4 pl-2">
                                    <div className="w-1/2 mb-4">
                                        {this.state.order.carts &&
                                            this.state.order.carts.map((cart, i) => (
                                                <div
                                                    className="flex items-start justify-start p-2 space-x-1 lg:space-x-4"
                                                    key={i}>
                                                    <div className="flex-shrink-0 w-8">
                                                        <span className="lg:h-7 lg:w-7 h-6 w-6 bg-base text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                                                            {i + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col w-full">

                                                        {this.state.order.type == 'PRODUCT' && <span>

                                                            <p className="text-sm font-bold" className="mb-2"> <b>{cart.product.name}</b></p>
                                                            {cart.product.attributes && Object.values(cart.product.attributes).map(attr => {
                                                                if (!attr.hidden) {
                                                                    return <p className="text-sm mb-0">{attr.title} : {attr.value}</p>
                                                                }
                                                            })}
                                                        </span>}
                                                        {this.state.order.type == 'MEMBERSHIP' && <span>

                                                            <p className="text-sm font-bold" className="mb-2"> <b>{cart.membership.title}</b></p>
                                                            <p className="text-sm mb-0">{cart.membership.validity ? cart.membership.validity.title : ''}</p>
                                                        </span>}

                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>



                                </div>
                                <hr className="my-2" />
                                <div className="flex flex-row flex-wrap pb-3 w-full mt-4 pl-2">
                                    <div className="w-2/3 ">

                                        {this.state.invoiceDetails && this.state.invoiceDetails.TermsAndCondition && JSON.parse(this.state.invoiceDetails.TermsAndCondition) && JSON.parse(this.state.invoiceDetails.TermsAndCondition).length > 0 && <div>

                                            <p><b>Terms & Conditions</b></p>
                                            <ul className="p-2">
                                                {
                                                    JSON.parse(this.state.invoiceDetails.TermsAndCondition).map((terms, i) => {
                                                        return <li>{i + 1}. {terms.TermsAndCondition}</li>
                                                    })
                                                }
                                            </ul>
                                        </div>}
                                    </div>


                                </div>
                                {this.state.invoiceDetails && this.state.invoiceDetails.endMsg && <div className="text-center border p-2 mt-4">{this.state.invoiceDetails.endMsg}</div>}

                            </div>
                        }
                    </div>
                )
            },
        ]
        return (
            <>
                <Widget>
                    <div className='tab-border'>

                        <UnderlinedTabs tabs={tabs} />
                    </div>
                </Widget>
            </>
        )
    }
}