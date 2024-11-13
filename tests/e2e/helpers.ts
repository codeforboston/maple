export const rfc3986EncodeURIComponent = (str: string) => {
    return encodeURIComponent(str).replace(/[!'()*]/g, escape);
}