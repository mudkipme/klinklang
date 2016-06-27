function jsonHeader() {
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  return headers;
}

export default async function request(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: jsonHeader()
  });
  return await response.json();
}