var fs = require('fs'),
  Promise = require('bluebird'),
  PNG = require('pngjs').PNG;

//var imgPath = __dirname+"/bg.1.png";

module.exports = function imgToCircle(imgPath) {

  return new Promise(function (resolve,reject) {
    try {
      fs.accessSync(imgPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      return reject(error);
    }
    fs.createReadStream(imgPath)
      .pipe(new PNG({
        filterType: 4
      })).on('parsed', function () {
        for (var y = 0; y < this.height; y++) {
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;
            // var radius = this.height / 2;
            var radius = this.width / 2;
            if (y >= Math.sqrt(Math.pow(radius, 2) - Math.pow(x - radius, 2)) + radius || y <= -(Math.sqrt(Math.pow(radius, 2) - Math.pow(x - radius, 2))) + radius) {
              this.data[idx + 3] = 0;
            }
          }
        }
        this.pack().pipe(fs.createWriteStream(imgPath));
      }).on('error', function (error) {
        reject(error);
      }).on('end', function () {
        resolve();
      });
  });
  
}


/*
imgToCircle(imgPath).then(function () {
  console.log('success');
}).catch(function (error) {
  console.log('======',error);
  
})
*/

  /* fs.createReadStream(imgPath)
  .on('error',function (params) {
    console.log('error');
  })
  .on('end',function (params) {
    console.log('end');
  })
  .pipe(new PNG({
    filterType: 4
  }))
  .on('parsed', function () {
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;
        var radius = this.height / 2;
        if (y >= Math.sqrt(Math.pow(radius, 2) - Math.pow(x - radius, 2)) + radius || y <= -(Math.sqrt(Math.pow(radius, 2) - Math.pow(x - radius, 2))) + radius) {
          this.data[idx + 3] = 0;
        }
      }
    }
    this.pack().pipe(fs.createWriteStream(imgPath2).on('error',function (params) {
      console.log('w error')
    }));
    
  })
  .on('error',function (params) {
    console.log('------------',params);
  })
  .on('end',function log(params) {
    console.log('end=================');
    
  }) */
  
  
  // imgToCircle(imgPath)
