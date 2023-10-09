import axios from "axios"
import { Alert } from "react-native"
//export const GOOGLE_CLIENT_ID ="409098998451-gr39e3kqci7dmlhqs87j2e9t8tpd9sih.apps.googleusercontent.com"
export const GOOGLE_CLIENT_ID = "491052300870-tua9v0mhoica1eouub73b1u6q3g26pju.apps.googleusercontent.com"
//export const BASE_URL = "https://live.geniqueeducation.com"
export const BASE_URL = "https://acmeacademy.in"
export const IGATE_URL = "https://igate.guru/"
export const BASE_URL_TEST = "https://live.geniqueeducation.com/"
// export const BASE_URL = "https://petrogate.in"
//export const API_KEY = "AIzaSyDmEf8_cHHVsJri11QG6LAcTjyIj5xej8Y"
// export const API_KEY = "AIzaSyDGROfOMJgFWsQGq-DoOb399Ciq_eCEccM"
// export const CHANNEL_ID = "UCDulRvE4Pi6JP3PFodGhCqQ"

export const fetchUserDetails = async (id, token) => {
    var details
    await axios.get(`${BASE_URL}/api/v1/users/${id}`, {
        headers: {
            'X-AUTH-TOKEN': token
        },
    })
        .then((data) => {
            details = data.data;
        });
    return details;
}

export const fetchVideos = async (token, offset, quality) => {

    var videos
    await axios.get(`${BASE_URL}/api/v1/videos?limit=10&&offset=${offset}&&quality=${quality}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            videos = data.data;
        });
    return videos;
}

export const fetchVideo = async (Uid, productID, token, pageOffset, quality) => {

    var videos
    await axios.get(`${BASE_URL}/api/v1/videos?chapterID=${Uid}&&productID=${productID}&&limit=10&&offset=${pageOffset}&&quality=${quality}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            videos = data.data;
        }).catch((err) => console.log("this is the error response >>>", err.response));
    return videos;
}

export const fetchLectureVideo = async (Uid, token, productID, pageOffset, quality) => {

    var videos
    await axios.get(`${BASE_URL}/api/v1/videos?chapterID=${Uid}&&productID=${productID}&&limit=10&&offset=${pageOffset}&&quality=${quality}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            videos = data.data;
        }).catch((err) => console.log("this is the error response >>>", err.response));
    return videos;
}

export const fetchProductType = async (token) => {
    var productTypes
    await axios.get(`${BASE_URL}/api/v1/product-types`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            productTypes = data.data;
        });
    return productTypes;
}

export const fetchLiveEvents = async (id, token, offset) => {
    var videos
    await axios.get(`${BASE_URL}/api/v1/live-events?chapterID=${id}&limit=10&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            videos = data.data;
        });
    return videos;
}


export const fetchBanners = async (token) => {
    var banners
    await axios.get(`${BASE_URL}/api/v1/banners`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            banners = data.data;
        });
    return banners;
}

export const fetchSingleVideo = async (id, productID, token, quality) => {
    var video
    await axios.get(`${BASE_URL}/api/v1/videos/${id}?productID=${productID}&&quality=${quality}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            video = data.data;
        });
    return video;
}


export const fetchSingleEvent = async (id, token, quality) => {
    var video
    await axios.get(`${BASE_URL}/api/v1/live-events/${id}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            video = data.data;
        });
    return video;
}


export const fetchQuestions = async (id, token, offset) => {
    var questions
    await axios.get(`${BASE_URL}/api/v1/one-line-questions/kb?chapterID=${id}&&limit=10&&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            questions = data.data;
        });
    return questions;
}


export const fetchCourses = async (token, offset) => {
    var courses
    console.log(token)
    await axios.get(`${BASE_URL}/api/v1/courses?limit=10&&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            courses = data.data;
        });
    return courses;
}

export const fetchSingleCourses = async (token, offset, id, mode) => {
    var courses
    console.log(token)
    await axios.get(`${BASE_URL}/api/v1/courses?examID=${id}&limit=10&offset=${offset}&mode=${mode}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            courses = data.data;
        });
    return courses;
}


export const fetchTopics = async (token, offset) => {
    var topics
    await axios.get(`${BASE_URL}/api/v1/topics?limit=10&&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            topics = data.data;
        });
    return topics;
}


export const fetchChapters = async (token, offset) => {
    var chapters
    await axios.get(`${BASE_URL}/api/v1/chapters?limit=10&&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            chapters = data.data;
        });
    return chapters;
}

export const fetchExams = async (token, offset) => {
    var exams
    await axios.get(`${BASE_URL}/api/v1/exams?limit=10&&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            exams = data.data;
        });
    return exams;
}

export const fetchReferAndEarn = async (token) => {
    var referandearn
    await axios.get(`${BASE_URL}/api/v1/users/refer-and-earn`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            referandearn = data.data;
        });
    return referandearn;
}

export const applyReferral = async (token, referral_code) => {
    var res;

    await fetch(`${BASE_URL}/api/v1/carts/apply-referral`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            referral_code
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response)
                res = response
            } else if (response.success == false) {
                alert(response.error)
            }
            else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const resetReferral = async (token) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/carts/delete-referral`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const fetchMyCourses = async (token, offset) => {
    var mycourse
    await axios.get(`${BASE_URL}/api/v1/users/active-products`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            mycourse = data.data;
        });
    return mycourse;
}



export const fetchChapterSubjectWise = async (token, offset, id) => {
    var chapters
    await axios.get(`${BASE_URL}/api/v1/chapters?subjectID=${id}&limit=10&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            chapters = data.data;
        });
    return chapters;
}


export const fetchPreviousPapers = async (id, token, offset) => {
    var topics
    await axios.get(`${BASE_URL}/api/v1/pyq-papers/kb?chapterID=${id}&&limit=10&&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        },
    })
        .then((data) => {
            topics = data.data;
        });
    return topics;
}

export const fetchSubject = async (id, token, offset) => {
    var subjects
    await axios.get(`${BASE_URL}/api/v1/subjects?courseID=${id}&&limit=10&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            subjects = data.data;
        });
    return subjects;
}

export const fetchProducts = async (id, token, offset) => {
    var products
    await axios.get(`${BASE_URL}/api/v1/products?offset=${offset}&limit=10&productTypeID=${id}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            products = data.data;
        });
    return products;
}

export const fetchProductsCoursewise = async (id, token, offset) => {
    var products
    await axios.get(`${BASE_URL}/api/v1/products?offset=${offset}&limit=10&courseID=${id}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            products = data.data;
        });
    return products;
}

export const fetchAllProducts = async (token, offset) => {
    var products
    await axios.get(`${BASE_URL}/api/v1/products?offset=${offset}&limit=10`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            products = data.data;
        });
    return products;
}

export const fetchProductDetails = async (id, token) => {
    var productDetail
    await axios.get(`${BASE_URL}/api/v1/products/${id}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            productDetail = data.data;
        });
    return productDetail;
}

export const fetchMyCourseDetails = async (productID, token) => {
    var myCourseDetail
    await axios.get(`${BASE_URL}/api/v1/users/active-products?productID=${productID}`, {
        headers: {
            'X-AUTH-TOKEN': token
        },
        body: JSON.stringify({
            productID
        })
    })
        .then((data) => {
            myCourseDetail = data.data;
        });
    return myCourseDetail;
}

export const fetchProductsCoursesWise = async (id, token, offset) => {
    var subjects
    await axios.get(`${BASE_URL}/api/v1/products?courseID=${id}&limit=10&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            subjects = data.data;
        });
    console.log(subjects)
    return subjects;

}

export const fetchProductsExamWise = async (id, token, offset) => {
    var subjects
    await axios.get(`${BASE_URL}/api/v1/products?examID=${id}&&limit=10&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            subjects = data.data;
        });
    return subjects;
}

export const fetchHomePageProduct = async (token) => {
    var products
    await axios.get(`${BASE_URL}/api/v1/homepage`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((data) => {
            products = data.data;
        });
    return products;
}

export const fetchSubjects = async (token, offset, id) => {
    var subjects
    await axios.get(`${BASE_URL}/api/v1/subjects?limit=10&&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    }).then((data) => {
        subjects = data.data;
    });
    console.log(subjects)
    return subjects;
}

export const searching = async (text, token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/search?searchKey=${text}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((res) => {
            data = res.data
        });
    return data
}


export const fetchBlog = async (token, offset) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/blogs?limit=10&&offset=${offset}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((res) => {
            data = res.data
        });
    return data
}


export const sendUserQuery = async (token, message, exam_id, subject_id, course_id, chapter_id) => {
    var res;

    await fetch(`${BASE_URL}/api/v1/enquiries/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            subject_id,
            exam_id,
            course_id,
            chapter_id
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response.error)
                res = response
            } else {
                console.log(response.details)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const addReview = async (token, ratting, message, product_id) => {
    var res;

    await fetch(`${BASE_URL}/api/v1/product-reviews/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ratting,
            message,
            product_id
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const addToCart = async (token, product_id, quantity, attributes) => {
    var res;

    await fetch(`${BASE_URL}/api/v1/carts/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id,
            quantity,
            attributes
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response)
                res = response
            } else {
                console.log(response)
                alert(response.error)
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const resetCoupon = async (token) => {
    var res;

    await fetch(`${BASE_URL}/api/v1/carts/delete-coupon`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const addToCartFree = async (token, product_id, amount, finalAmount, attributes, pay_via) => {
    var res;

    await fetch(`${BASE_URL}/api/v1/orders/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id,
            amount,
            finalAmount,
            attributes,
            pay_via
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response)
                res = response
            } else {
                console.log(response)
                alert(response.error)
                console.log(JSON.stringify(response.error))
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const removeFromCart = async (token, id) => {
    var res;

    await fetch(`${BASE_URL}/api/v1/carts/delete`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const checkPaymentStatus = async (token, uuid) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/orders/check-status`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uuid
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const applyCoupon = async (token, coupon_code) => {
    var res;

    await fetch(`${BASE_URL}/api/v1/carts/apply-coupon`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            coupon_code
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response)
                res = response
            } else if (response.success == false) {
                alert(response.error)
            }
            else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}




export const uploadPost = async (token, message, subjectID) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/posts/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            body: message,
            subject_id: subjectID
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response.error)
                res = response
            } else {
                console.log(response.details)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}


export const featureSplash = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/uploads/splash`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((res) => {
            data = res.data
        });
    return data
}

export const checkUserAuth = async (data) => {
    var response;
    const body = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        auth_provider: data.auth_provider,
        oauth_id: data.oauth_id,
    }
    await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then((res) => res.json())
        .then((res) => {
            console.log("Hit and trial")
            response = res
        })
    return response;
}

export const fetchPosts = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/posts`, {
        headers: {
            'X-AUTH-TOKEN': token
        },
    })
        .then((res) => {
            data = res.data
        });
    console.log(data)
    return data
}

export const fetchComments = async (token, id) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/comments?postID=${id}`, {
        headers: {
            'X-AUTH-TOKEN': token
        },
    })
        .then((res) => {
            data = res.data
        });
    console.log(data)
    return data
}


export const addComments = async (token, comment, id) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/comments/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            post_id: id,
            comment: comment
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response.error)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}


export const fetchEnquiry = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/enquiries/user-enquiries`, {
        headers: {
            'X-AUTH-TOKEN': token
        },
    })
        .then((res) => {
            data = res.data
        });
    console.log(data)
    return data
}


export const fetchTestSeries = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/graphs/test-series`, {
        headers: {
            'X-AUTH-TOKEN': token
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            }
        });
    return data
}


export const fetchVideoSeries = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/graphs/videos`, {
        headers: {
            'X-AUTH-TOKEN': token
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            }
        });
    console.log(data)
    return data
}

export const sendVideoLogs = async (token, id) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/videos/add-view?videoID=${id}`, {
        headers: {
            'X-AUTH-TOKEN': token
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            }
        });
    console.log(data);
    return data
}



export const fetchVideoComments = async (token, id) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/video-comments?videoID=${id}`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            }
        });
    console.log(data)
    return data
}


export const fetchVideoLikes = async (token, id) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/videos/likes?videoID=${id}`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            }
        });
    console.log(data)
    return data
}



export const addVideoLikes = async (token, id) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/videos/likes/like`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            video_id: id,
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response.error)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}



export const addVideoComments = async (token, comment, id) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/video-comments/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            video_id: id,
            comment: comment
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response.error)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}


export const removeVideoLikes = async (token, id) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/videos/likes/remove-like`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            video_id: id,
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response.error)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}


export const addVideoWatchList = async (token, id) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/videos/watch-lists/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            video_id: id,
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response.error)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const removeWatchLists = async (token, id) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/videos/watch-lists/remove`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            video_id: id,
        })
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
                console.log(response.error)
                res = response
            } else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}


export const addRaiseTickets = async (token, ticket) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/raise-tickets/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticket)
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
            } else {
                res = response
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}

export const fetchRaiseTickets = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/raise-tickets/user_tickets`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    console.log(data)
    return data
}

export const fetchSingleTicket = async (token, id) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/raise-tickets/${id}`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    console.log(data)
    return data
}



export const raiseTicketWithoutLogin = async (token, ticket) => {
    var res;
    await fetch(`${BASE_URL}/api/v1/raise-tickets/add`, {
        method: 'POST',
        headers: {
            'X-AUTH-TOKEN': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticket)
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                res = response
            }
            else {
                console.log(response)
                alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
            }
        })
        .catch((err) => console.log(err))
    return res;
}


export const fetchWatchHistory = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/videos/watch-history`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            console.log("CHECKING WATCH HISTORY")
            console.log(res)
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            //console.log(error)
            //Alert.alert(error)
            //Alert.alert("Whoopssssss!  We are having some temporary connection issue. Please try after sometime.")
        })
    console.log("CHECKING WATCH HISTORY")
    console.log(data)
    return data
}

// export const fetchWatchHistory = async (token) => {
//     var data;
//     await axios.get(`${BASE_URL}/api/v1/videos/watch-history`,{
//         headers:{
//             'X-AUTH-TOKEN':token,
//         },
//     })
//     .then((res) =>{
//         if(res.data.success){
//             data=res.data                 
//         }else{
//             data=res.data                 
//         }
//     })
//     .catch(error =>{
//         Alert.alert("Someting went wrong")
//     })
//     console.log(data)
//     return data
// }


export const fetchWatchList = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/videos/watch-lists`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    console.log(data)
    return data
}

//&productID=${productID}

export const fetchNotificationsforall = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/push-notifications/user`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })

    //console.log(data)
    return data
}

export const fetchNotifications = async (token, id) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/push-notifications/user?productID=${id}`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    console.log(data)
    return data
}

export const fetchLiveClass = async (token, id) => {
    var data
    await axios.get(`${BASE_URL}/api/v1/live-events?productID=${id}`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((res) => {
            //console.log(res.data.events)
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    // console.log("LIVE DATA CONFIG FILE")
    // console.log(data)
    return data;
}

export const fetchLiveClassWebinar = async (token, offset) => {
    var data
    await axios.get(`${BASE_URL}/api/v1/live-events?limit=10&&offset=${offset}&&viewType=FREE`, {
        //await axios.get(`${BASE_URL}/api/v1/live-events?productID=42`, {
        headers: {
            'X-AUTH-TOKEN': token
        }
    })
        .then((res) => {
            //console.log(res.data.events)
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            //Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    console.log("LIVE DATA CONFIG FILE")
    console.log(data)
    return data;
}

export const fetchCartList = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/carts`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    console.log(data)
    return data
}

export const fetchOrderList = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/orders`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    console.log(data)
    return data
}

export const checkUserState = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/users/check-token`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    return data
}

export const checkVideoThreshold = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/users/video-thresold`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    return data
}



export const refreshToken = async (token) => {
    var data;
    await axios.get(`${BASE_URL}/api/v1/auth/token-refresh`, {
        headers: {
            'X-AUTH-TOKEN': token,
        },
    })
        .then((res) => {
            if (res.data.success) {
                data = res.data
            } else {
                data = res.data
            }
            console.log(res.data)

        })
        .catch(error => {
            Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        })
    return data
}

