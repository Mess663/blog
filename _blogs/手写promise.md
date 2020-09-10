
``` js
function Promise2(fn){
  const self = this
  this.resloveCallbacks = []
  this.rejectCallbacks = []
  this.status = 0
  this.data = null
  this.rejectReason = ''

  const resolve = function(res) {
    setTimeout(() => {
      self.data = res
      self.status = 1
      self.resloveCallbacks.forEach(item => item(res));
    }, 0);
  }

  const reject = function(err) {
    setTimeout(() => {
      self.rejectReason = err
      self.status = -1

      self.rejectCallbacks.forEach(item => item(err));
    }, 0);
  }
  
  try {
    fn(resolve, reject)
  } catch (error) {
    reject(self.rejectReason)
  }
}
Promise2.prototype.then = function(resolve, reject) {

  if (this.status === 0) {
    return new Promise((nextResolve, nextReject) => {
      this.resloveCallbacks.push((data) => {
        try {
          const thenRes = resolve(data)

          resolvePromise(thenRes, nextResolve, nextReject)
        } catch (error) {
          nextReject(error)
        }
      })
  
      this.rejectCallbacks.push(reject)
    })
  } 

  if (this.status === 1) {
    return new Promise2((nextResolve, nextReject) => {
      setTimeout(() => {
        try {
          const thenRes = resolve(this.data)
  
          resolvePromise(thenRes, nextResolve, nextReject)
        } catch (error) {
          nextReject(error)
        }
      })
    })
  }

  if (this.status === -1) {
    return new Promise2((nextResolve, nextReject) => {
      setTimeout(() => {
        try {
          const thenRes = resolve(this.rejectReason)
  
          resolvePromise(thenRes, nextResolve, nextReject)
        } catch (error) {
          nextReject(error)
        }
      })
    })
  }
}

function resolvePromise(thenRes, nextResolve, nextReject) {
  if (thenRes instanceof Promise2) {
    thenRes.then(nextResolve, nextReject)
  } else {
    nextResolve(thenRes)
  }
}

const promise = new Promise2(function(x,y){
  setTimeout(()=>{
      x(101)
  }, 1000)
})

promise.then((z)=>{
  console.log(z)
  return new Promise2((x) => setTimeout(() => x(102), 1000))
}).then((x) => {
  console.log(x)
  return 103
}).then(console.log)
```
