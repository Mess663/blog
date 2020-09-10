import './index.less';
import { apiPost } from 'src/common/request/index';
import $ from 'jquery'

const btn = $('.btn')
let isSubmiting = false

btn.click(() => {
  if (isSubmiting) return

  const uid = window.prompt("输入密码", "");

  const title = document.querySelector('.title-input').value;
  const content = document.querySelector( '.content-input').innerText;

  isSubmiting = true
  
  apiPost('/api/isAdmin', {uid})
    .then(res => res.data.status ? Promise.resolve() : Promise.reject(new Error('uid错误')))
    .then(() => apiPost('/api/article', {title, content}))
    .then((res) => {
      if (res.data.status) {
        window.location.href = `/article?id=${res.data.id}`
      }
    })
    .catch((err) => {
      isSubmiting = false
      console.error(err)
      alert('上传出错')
    })
})

