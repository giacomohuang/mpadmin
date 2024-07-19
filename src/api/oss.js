import fetch from './fetch'
import baseUrl from './baseUrl'

const oss = {
  uploadPart(formData) {
    // console.log(partNumber, filename, uploadId, hash)
    return fetch({
      timeout: 30 * 60 * 1000,
      baseURL: baseUrl.default,
      method: 'post',
      data: formData,
      url: '/oss/uploadPart',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  completeMultipartUpload(filename, uploadId, etags) {
    // console.log('***etags', etags)
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { uploadId: uploadId, etags: JSON.stringify(etags), filename: encodeURIComponent(filename) },
      url: '/oss/completeMultipartUpload'
    }).catch((err) => {
      console.log(err)
    })
  },

  initNewMultipartUpload(filename) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { filename },
      url: '/oss/initNewMultipartUpload'
    })
  }
}

export default oss
