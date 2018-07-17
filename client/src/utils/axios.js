/*
 * Created by jemo on 2018-6-6.
 * axios
 */

import axios from "axios";

const instance = axios.create({
  //baseURL: 'http://localhost:3001/api',
  baseURL: 'http://192.168.31.217:3001/api',
  // baseURL: "/api",
  timeout: 1000
});

export default instance;
