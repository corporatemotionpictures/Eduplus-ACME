import define from 'src/json/worddefination.json'
import Link from 'next/link'
import React, { useState, useEffect } from 'react';
import { getSettings } from 'helpers/apiService';


export default function success() {

    const [paymentSuccessPage, setpaymentSuccessPage] = useState(null)
    const [first, setFirst] = useState(true)

    useEffect(() => {
        async function getInnerdata() {
            let data = await getSettings('payment_success_page')
            setpaymentSuccessPage(data)
        }

        getInnerdata()

        setFirst(false)
        return
    }, [first])

    return <>
        {
            paymentSuccessPage == 'YES' && <div className="responseBody">
                <div className="card">
                    <div >
                        <i class="fas fa-times checkmark-wrong"></i>
                    </div>
                    <h1 className="heading-wrong mb-4">Failed</h1>
                    <Link href="/">
                        <a className="text-primary btn btn-primary">Back to Home</a>
                    </Link>
                    {/* <p>Thank you for your order!</p> */}
                </div>
            </div>
            ||
            "FAILED"
        }
    </>
}