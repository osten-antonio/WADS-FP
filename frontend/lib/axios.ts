import "server-only";
import axios from 'axios';

const backendProtocol = process.env.BACKEND_PROTOCOL ?? "http";
const backendHostname = process.env.BACKEND_HOSTNAME ?? "localhost";
const backendPort = process.env.BACKEND_PORT ?? "8000";
const backendUrl = `${backendProtocol}://${backendHostname}:${backendPort}`;
export const backendApi = axios.create({
  baseURL: backendUrl,
  timeout: 60000,
});
