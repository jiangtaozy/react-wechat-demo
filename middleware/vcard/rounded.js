var fs = require('fs'),
  Promise = require('bluebird'),
  PNG = require('pngjs').PNG;

//var imgPath = __dirname +"/qrcode.png";

module.exports = function imgToRounded(imgPath) {

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
        
        var radius = this.width * 0.1;
        radius = Math.floor(radius);
        var p1x = radius;
        var p1y = radius;
        var p2x = this.width - radius;
        var p2y = p1y;
        var p3x = p1x;
        var p3y = this.height - radius;
        var p4x = p2x;
        var p4y = p3y;

        for (var x = 0; x < radius; x++  ){
          for (var y = 0; y < radius; y++ ){
            var idx = (this.width * y + x) << 2;
            if( Math.pow( x - p1x , 2) + Math.pow( y - p1y, 2  ) >= Math.pow( radius , 2)  ){
              this.data[idx + 3] = 0;
            }
          }
        }
        for (var x = p2x; x < this.width; x++) {
          for (var y = 0; y < radius; y++) {
            var idx = (this.width * y + x) << 2;
            if (Math.pow(x - p2x, 2) + Math.pow(y - p2y, 2) >= Math.pow(radius, 2)) {
              this.data[idx + 3] = 0;
            }
          }
        }
        for (var x = 0; x < radius; x++) {
          for (var y = p3y ; y < this.height ; y++) {
            var idx = (this.width * y + x) << 2;
            if (Math.pow(x - p3x, 2) + Math.pow(y - p3y, 2) >= Math.pow(radius, 2)) {
              this.data[idx + 3] = 0;
            }
          }
        }
        for (var x = p4x; x < this.width ; x++) {
          for (var y = p4y; y < this.height; y++) {
            var idx = (this.width * y + x) << 2;
            if (Math.pow(x - p4x, 2) + Math.pow(y - p4y, 2) >= Math.pow(radius, 2)) {
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
imgToRounded(imgPath).then(function () {
  console.log('success');
}).catch(function (error) {
  console.log('======',error);
  
})
*/
