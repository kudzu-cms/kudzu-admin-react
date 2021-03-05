import axios from "axios"
import { KUDZU_BASE_URL } from "../../KudzuAdmin";

function fetchContentTypes() {
  return axios.get(`${KUDZU_BASE_URL}/api/contents/meta`, {
    withCredentials: true,
  })
}

function fetchContentOfType(type) {
  return axios.get(`${KUDZU_BASE_URL}/api/contents?type=${type}`, {
    withCredentials: false,
  })
}

function fetchContentItem(type, uuid) {
  return axios.get(`${KUDZU_BASE_URL}/api/content?slug=${type}-${uuid}`, {
    withCredentials: false,
  })
}

export {
  fetchContentItem,
  fetchContentOfType,
  fetchContentTypes,
}
