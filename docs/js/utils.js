const $ = document.querySelector.bind(document)
const $all = document.querySelectorAll.bind(document)

function getObjectURL(file) {
  var url = null ;
  if (window.createObjectURL!=undefined) { // basic
      url = window.createObjectURL(file) ;
  } else if (window.URL!=undefined) { // mozilla(firefox)
      url = window.URL.createObjectURL(file) ;
  } else if (window.webkitURL!=undefined) { // webkit or chrome
      url = window.webkitURL.createObjectURL(file) ;
  }
  return url ;
}

function throttle(fn, time) {
  let timer = null

  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.call(this, ...args)
        timer = null
      }, time);
    }
  }
}
