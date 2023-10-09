import define from 'src/json/worddefination.json'
import Link from 'next/link'
import React, { useState, useEffect } from 'react';
import {  getSettings } from 'helpers/apiService';

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
                        <i className="checkmark">✓</i>
                    </div>
                    <h1>Success</h1>
                    <p>Your payment is successfull</p>
                    <p className="mb-4">Thank you for your order!</p>
                    <Link href="/accounts/orders">
                        <a className="text-primary btn btn-primary">Check my acccount to download invoice</a>
                    </Link>

                </div>
            </div>
            ||
            "SUCCESS"
        }
    </>
}