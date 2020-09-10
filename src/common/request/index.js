import axios from "axios"

export const apiGet = (url = '', param = {}) => axios.get(url, param)

export const apiPost = (url = '', param = {}) => axios.post(url, param)