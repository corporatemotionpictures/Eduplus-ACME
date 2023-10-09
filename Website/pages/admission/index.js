import Link from "next/link";
import AppStoreFooter from "components/website/AppStoreFooter";
import define from 'src/json/worddefination.json'
export default function courses() {
   return (
      <>
         <header className="header_inner courses_page">
            <div className="intro_wrapper admission_page">
               <div className="container">
                  <div className="row">
                     <div className="col-sm-12 col-md-8 col-lg-8">
                        <div className="intro_text">
                           <h1>Admission</h1>
                        </div>

                     </div>
                  </div>
               </div>
            </div>
         </header>
         {/* mid content starts */}
         <section className="about_us my-2" id="courses_details_wrapper">
            <div className="container">
               <div className="row about_content_wrapper pb-1">
                  <div className="col-12 col-sm-12 col-md-9 col-lg-9">
                     <div className="about_title ">
                        <span>Admission Process</span>
                        <h2>Instructions</h2>
                     </div>
                     <p className="text-justify mb-2">
                        <strong>Interested students can take admission by any one of the below mention process:</strong>
                     </p>

                     <p className="text-justify"><strong><span className="font-saffron">Note:</span></strong> There is NO Registration Fee.</p>
                  </div>
                  <div className="col-12 col-sm-12 col-md-3 col-lg-3 sm-pt-4">
                     <div className="about_banner_down p-0">
                        <img src="/website/assets/images/banner/admission_head.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid image-radius" />
                     </div>
                  </div>
               </div>
               <div className="row about_content_wrapper admission_block mt-5 pb-1">
                  <div className="col-12 col-sm-12 col-md-8 col-lg-8">
                     <div className="sign__wrapper-2 white-bg">
                        <div className="icon_wrapper">
                           <i className="flaticon-email"></i>
                        </div>
                        <h5 className="text-center">
                           <strong>
                              <Link href="/auth/register">
                                 <a target="_blank">ONLINE REGISTRATION</a>
                              </Link>
                           </strong>
                        </h5>
                        <div>
                           <p>STEP 1: Create your account by SIGN-IN with basic details</p>
                           <p>STEP 2: USER LOGIN with mobile number and password</p>
                           <p>STEP 3: Fill the ACCOUNT INFO with correct details and save the information</p>
                           <p>STEP 4: Select the interested program and add to your cart</p>
                           <p>STEP 5: Select Compatibility and Language</p>
                           <p>STEP 6: Use Promocode “FIRST60” to pay 1st installment of the course fee</p>
                           <p>STEP 7: Make Payment and start learning</p>
                        </div>
                     </div>
                  </div>
                  <div className="col-12 col-sm-12 col-md-4 col-lg-4 sm-pt-4">
                     <div className="sign__wrapper-2 white-bg">
                        <div className="icon_wrapper">
                           <i className="flaticon-edit"></i>
                        </div>
                        <h5 className="text-center"><strong>DOCUMENTS REQUIRED</strong></h5>
                        <ul>
                           <li>Passport size photograph (2 copy)</li>
                           <li>A self- attested copy of Identity Proof (Such as Passport/ Voter ID/ Aadhar Card/ PAN Card etc.).</li>
                           <li>A self-attested copy of college ID/mark sheet/degree</li>
                        </ul>
                     </div>
                  </div>
               </div>
               <div className="row about_content_wrapper mt-5">
                  <div className="col-12 col-sm-12 col-md-12 col-lg-12">
                     <h4><strong>For Direct Registration</strong></h4>
                     <p className="text-justify"><strong>You may directly approach acme Office where you are required to complete the following formalities:</strong></p>
                     <ul>
                        <li>Fill the detailed <a target="_blank" href="/website/assets/pdf/Registration_Form.pdf">Registration Form. </a></li>
                        <li>Attach passport size photographs with the Registration Form.</li>
                        <li>Attach self- attested copy of Identity Proof (Such as Passport/ Voter ID/ Driving License/ PAN Card etc.)</li>
                        <li>A self-attested copy of college ID</li>
                        <li>Deposit the 1st installment of the fee at the acme Office</li>
                     </ul>

                     <hr>
                     </hr>


                     <h6 className="mb-3 mt-3"><b><span className="font-saffron">Note:</span></b> Your admission to the concerned batch is provisional. It will be confirmed after we get payment confirmation.</h6>
                  </div>
               </div>
            </div>
            <AppStoreFooter />
         </section>
         {/* mid content ends */}
      </>
   )
}