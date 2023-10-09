import { SET_ARTICLE_DETAILS, API, FETCH_ARTICLE_DETAILS } from "helpers/redux/actions/types";

export function fetchArticleDetails() {
  return apiAction({
    url: "https://jsonplaceholder.typicode.com/todos/1",
    onSuccess: setArticleDetails,
    onFailure: () => console.log("Error occured loading articles"),
    label: FETCH_ARTICLE_DETAILS
  });
}

export function fetchPost(label) {
  return apiAction({
    url: "https://jsonplaceholder.typicode.com/todos/1",
    onSuccess: setArticleDetails,
    onFailure: () => console.log("Error occured loading articles"),
    label: label
  });
}

function setArticleDetails(data) {
  return {
    type: SET_ARTICLE_DETAILS,
    payload: data
  };
}

function apiAction({
  url = "",
  method = "GET",
  data = null,
  accessToken = null,
  onSuccess = () => {},
  onFailure = () => {},
  label = "",
  headersOverride = null
}) {
  return {
    type: API,
    payload: {
      url,
      method,
      data,
      accessToken,
      onSuccess,
      onFailure,
      label,
      headersOverride
    }
  };
}
