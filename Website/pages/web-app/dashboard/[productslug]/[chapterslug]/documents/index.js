import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { get, fetchByID } from 'helpers/apiService';
import Filter from 'components/classical-ui/filters'
import { useRouter } from 'next/router'

import define from 'src/json/worddefination.json'

export default function MyCourses(params) {

	const [previousYearQuestions, setPyqPapers] = useState({})
	const [chapter, setChapter] = useState({})
	const [subject, setSubject] = useState({})
	const [first, setFirst] = useState(true)
	const [product, setProduct] = useState(true)
	const [totalIndex, setTotalIndex] = useState(0)
	const router = useRouter()

	// Call first time when component rander
	useEffect(() => {
		async function getInnerdata() {
			if (first == true) {

				let data = await get(`products/slug?slug=${router.query.productslug}`)
				let productid = data.product ? data.product.id : null
				setProduct(data.product)

				let dataSlug = router.query.chapterslug.split('-')

				let subjectID = dataSlug[0]
				let chapterID = dataSlug[1]

				data = await fetchByID(`chapters`, chapterID)
				let chapter = data.chapter ? data.chapter : null
				setChapter(chapter)

				data = await fetchByID(`subjects`, subjectID)
				let subject = data.subject ? data.subject : null
				setSubject(subject)

				let filters = { chapterID: chapterID, productID: productid, offLimit: true }

				var previousYearQuestions = await get('pyq-papers', filters)

				setPyqPapers(previousYearQuestions.previousYearQuestions)

			}
		}

		getInnerdata()

		return setFirst(false)
	}, [first])


	return (

		<>
			<section className="popular_courses webbgdashboard">
				<div className="container pb-3">
					<br />
					<h1 className="page-title text-white"> {chapter && chapter.name}</h1>
					<p className="text-white">
						<h4 className="cart_btn">{product && product.name} / <span className="font-bold font-blue">{chapter && chapter.name}</span> Documents</h4>
						<hr className="mb-2 mt-2"></hr>
					</p>
				</div>

				<section className="popular_courses">
					<div className="container pb-3">

					</div>
					<div className="container">
						<div className="row">
							<div className={'col-sm-12'}>

								<div className="row">

									{
										previousYearQuestions && previousYearQuestions.length > 0 &&
										previousYearQuestions.map(previousYearQuestion => {

											return (

												<div className={`col-12 col-sm-3 col-md-6 col-lg-3`}>
													<div className="single-courses">

														<div className="courses_info_wrapper">
															<div className="courses_title">
																<h3 className="min-height-4">
																	<Link href={`/web-app/dashboard/[productslug]/[chapterslug]/documents/[slug]`} as={`/web-app/dashboard/${router.query.productslug}/${chapter.id}-${chapter.id}/documents/${previousYearQuestion.id}`}>
																		<a className="cart_btn mb-3 text-limit">{previousYearQuestion.title}</a>
																	</Link>
																</h3>

															</div>


														</div>
													</div>

												</div>
											)
										})
										||
										<div className="empty_box">
											<h2 className="text-center"><i className="fas fa-cart-plus"></i></h2>
											<h5 className="text-center"> <b className="font-saffron"><b></b></b>No Document found.</h5>
										</div>
									}

								</div>
							</div>
						</div>
					</div>
				</section >
			</section>
		</>
	)
}