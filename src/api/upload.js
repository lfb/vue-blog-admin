import request from '@/utils/request'

// 获取上传图片token
export function getToken(params) {
  return request({
    url: '/upload/token',
    method: 'post',
    params
  })
}
// 获取上传图片
export function uploadImage(data) {
  return request({
    url: '/upload/images',
    method: 'post',
    data
  })
}
