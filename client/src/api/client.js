import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export async function parseResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await api.post('/parse', formData);
  return data.text;
}

export async function scrapeJob(url) {
  const { data } = await api.post('/scrape', { url });
  return data.text;
}

export async function tailorResume(resumeText, jobDescription) {
  const { data } = await api.post('/tailor', { resumeText, jobDescription });
  return data;
}
