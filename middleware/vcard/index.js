const gm = require('gm');
const fs = require('fs');
const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const request = require('request');
const QRCode = require('qrcode');
const path = require('path');
const circle = require('./circle');
const rounded = require('./rounded');

/*
## ubuntu 安装graphicsmagick:
sudo apt-get install python-software-properties
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:rwky/graphicsmagick
sudo apt-get update
sudo apt-get install graphicsmagick
*/

/*
var bgUrl = 'http://img.chslab.com:8780/img/HJwBC4YLM.png';
var logoUrl = 'http://img.chslab.com:8780/img/ryODZSt8G.jpeg';
var qrcodeUrl = 'http://hashuo.chslab.com';
var  vcard = {
    name_color:"#000FFF",
    name_px:"20",
    name_py:"20",
    name_font_size:"24",
    name_font:"肥肥扭扭体.ttf",
    name_display:"block",
    
    logo_size:"50",
    logo_px:"50",
    logo_py:"50",
    logo_display:"block",
    logo_radius:"50",
    qrcode_size: "100",
    qrcode_px: "150",
    qrcode_py: "50",
    qrcode_display: "block"
}
generateVCard(bgUrl, logoUrl, qrcodeUrl, "你&#很好地", vcard).then(cardName => {
    console.log('cardName: ', cardName);
}).catch(err => {
    console.error('error: ', err);
})

//console.log(__dirname);
*/

exports.generateVCard = generateVCard;
exports.deleteTemImg = deleteTemImg;

function generateVCard(defaultBgUrl, logoUrl, qrcodeUrl,
        memberName, weixinId, userLevel, eshopName, VCradCustomInfo ) {
  var bgName = 'bg_' + uuidv4() + ".png";
  var temBg = path.resolve(__dirname, 'tem/', bgName);
  var temLogo = path.resolve(__dirname, 'tem/', 'logo_' + uuidv4() + ".png");
  var temQRCode = path.resolve(__dirname, 'tem/', 'qrcode_' + uuidv4() + ".png");
  VCradCustomInfo = VCradCustomInfo || {
    name_color: "#000000",
    name_px: "0",
    name_py: "0",
    name_font_size: "14",
    name_font: "逐浪粗隶书法体.otf",
    name_display: "block",
    wxh_color: "#000000",
    wxh_px: "0",
    wxh_py: "0",
    wxh_font_size: "14",
    wxh_font: "逐浪粗隶书法体.otf",
    wxh_display: "block",
    level_color: "#000000",
    level_px: "0",
    level_py: "0",
    level_font_size: "14",
    level_font: "逐浪粗隶书法体.otf",
    level_display: "block",
    sqdw_color: "#000000",
    sqdw_px: "0",
    sqdw_py: "0",
    sqdw_font_size: "14",
    sqdw_font: "逐浪粗隶书法体.otf",
    sqdw_display: "block",
    logo_size: "50",
    logo_px: "0",
    logo_py: "0",
    logo_display: "block",
    logo_radius: "0",
    qrcode_size: "300",
    qrcode_px: "0",
    qrcode_py: "0",
    qrcode_display: "block"
  };
  var bgUrl = VCradCustomInfo.bg || defaultBgUrl;
  if( !bgUrl ){
    return Promise.reject({
      message:"没有可用的背景图片"
    });
  }
  if (!qrcodeUrl) {
    return Promise.reject({
      message: "没有可用的二维码图片"
    });
  }
  var promiseArr = [];
  if ( !logoUrl || VCradCustomInfo.logo_display == "none"  ){
    promiseArr = [
      resizeImg(request(bgUrl), temBg,640, 960),
      resizeQRcode(qrcodeUrl, temQRCode, VCradCustomInfo.qrcode_size, VCradCustomInfo.qrcode_size),
    ];
  }else{
    promiseArr = [
      resizeImg(request(bgUrl), temBg, 640, 960),
      resizeImg(request(logoUrl), temLogo, VCradCustomInfo.logo_size, VCradCustomInfo.logo_size).then(() => {
          if(VCradCustomInfo.logo_radius == '50') {
              return circle(temLogo);
          } else if(VCradCustomInfo.logo_radius == '10') {
              return rounded(temLogo);
          } else {
              return Promise.resolve();
          }
      }),
      resizeQRcode(qrcodeUrl, temQRCode, VCradCustomInfo.qrcode_size, VCradCustomInfo.qrcode_size),
    ];
  }
  return Promise.all(promiseArr).then(function () {
    if (!logoUrl || VCradCustomInfo.logo_display == "none") {
      //return Promise.resolve(gm().in('-page', '+0+0').in(temBg));
      return Promise.resolve(gm().in(temBg));
    } else {
      //return addImg(gm().in('-page', '+0+0').in(temBg), temLogo, VCradCustomInfo.logo_px, VCradCustomInfo.logo_py);
      return addImg(gm().in(temBg), temLogo, VCradCustomInfo.logo_px, VCradCustomInfo.logo_py);
    }
  }).then(function(image) {
    return addImg(image, temQRCode, VCradCustomInfo.qrcode_px, VCradCustomInfo.qrcode_py);
  }).then(function(image) {
    return new Promise(function (resolve,reject) {
      image
      .write(temBg, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }).then(function(image) {
    if (VCradCustomInfo.name_display == 'none' || !memberName) {
      //return Promise.resolve(image);
      return Promise.resolve(gm().in(temBg));
    } else {
      //return addName(image, memberName,__dirname+"/"+VCradCustomInfo.name_font, VCradCustomInfo.name_color, VCradCustomInfo.name_font_size, VCradCustomInfo.name_px, VCradCustomInfo.name_py);
      return addName(gm().in(temBg), memberName,__dirname+"/"+VCradCustomInfo.name_font, VCradCustomInfo.name_color, VCradCustomInfo.name_font_size, VCradCustomInfo.name_px, VCradCustomInfo.name_py);
    }
  }).then(function (image) {
    if (VCradCustomInfo.wxh_display == 'none' || !weixinId) {
      return Promise.resolve(image);
    } else {
      return addName(image, weixinId,__dirname+"/"+VCradCustomInfo.wxh_font, VCradCustomInfo.wxh_color, VCradCustomInfo.wxh_font_size, VCradCustomInfo.wxh_px, VCradCustomInfo.wxh_py);
    }
  }).then(function (image) {
    if (VCradCustomInfo.level_display == 'none' || !userLevel) {
      return Promise.resolve(image);
    } else {
      return addName(image, userLevel,__dirname+"/"+VCradCustomInfo.level_font, VCradCustomInfo.level_color, VCradCustomInfo.level_font_size, VCradCustomInfo.level_px, VCradCustomInfo.level_py);
    }
  }).then(function (image) {
    if (VCradCustomInfo.sqdw_display == 'none' || !eshopName) {
      return Promise.resolve(image);
    } else {
      return addName(image, eshopName,__dirname+"/"+VCradCustomInfo.sqdw_font, VCradCustomInfo.sqdw_color, VCradCustomInfo.sqdw_font_size, VCradCustomInfo.sqdw_px, VCradCustomInfo.sqdw_py);
    }
  }).then(function(image) {
    return new Promise(function (resolve,reject) {
      image
      .write(temBg, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }).then(function() {
    deleteTemImg(temLogo);
    deleteTemImg(temQRCode);
    return Promise.resolve(bgName);
  }).catch(function(err) {
    deleteTemImg(temBg);
    deleteTemImg(temLogo);
    deleteTemImg(temQRCode);
    return Promise.reject(err);
  });
}

function resizeImg(imgPath,resizeSavePath,width,height) {
  return new Promise(function (resolve, reject) {
    gm(imgPath)
      .resize(width, height, '!')
      .write(resizeSavePath, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
  })
}

function resizeQRcode(qrcodeUrl,resizeSavePath,width,height) {
  //var FArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(qrcodeUrl, {
        //color: {
        //    dark: '#' + FArr[Math.floor(Math.random() * 16)] + FArr[Math.floor(Math.random() * 16)] + FArr[Math.floor(Math.random() * 16)],  // Blue dots
        //    light: '#FFF' // Transparent background
        //}
        margin: 1,
    }, function (err, qrcode) {
        if (err) {
            return reject(err);
        } else {
            return resolve(qrcode);
        }
    });
  }).then(qrcode => {
      var imageData = new Buffer(qrcode.replace(/^data:image\/png;base64,/, ""), "base64");
      gm(imageData)
      .resize(width, height, '!')
      .write(resizeSavePath, function (err) {
        if (err) {
          return Promise.reject(err);
        } else {
          return Promise.resolve();
        }
      });
  });
}

function addName(image,name,font, color,fontSize,pX,pY) {
  pY = parseInt(pY) + parseInt(fontSize);
  return Promise.resolve(
    image
    .font(font, fontSize)
    .fill(color)
    .drawText(pX, pY, name)
  );
}

function addImg(image,overImgPath,pX,pY) {
  return Promise.resolve(
    image
      .in('-page', '+' + pX + '+' + pY)
      .in(overImgPath)
      .flatten()
  );
}

function deleteTemImg(temImg) {
  fs.access(temImg, fs.constants.F_OK,function (err) {
    if( !err ){
      fs.unlink(temImg, function (err) {
        // 删除文件失败
        if(err) {
            logger.info(err);
        }
      })
    }
  });
}
