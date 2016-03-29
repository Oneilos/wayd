String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function utf8_encode(argString) {
  //  discuss at: http://phpjs.org/functions/utf8_encode/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: sowberry
  // improved by: Jack
  // improved by: Yves Sucaet
  // improved by: kirilloid
  // bugfixed by: Onno Marsman
  // bugfixed by: Onno Marsman
  // bugfixed by: Ulrich
  // bugfixed by: Rafal Kukawski
  // bugfixed by: kirilloid
  //   example 1: utf8_encode('Kevin van Zonneveld');
  //   returns 1: 'Kevin van Zonneveld'

  if (argString === null || typeof argString === 'undefined') {
    return '';
  }

  // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  var string = (argString + '');
  var utftext = '',
    start, end, stringl = 0;

  start = end = 0;
  stringl = string.length;
  for (var n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n);
    var enc = null;

    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode(
        (c1 >> 6) | 192, (c1 & 63) | 128
      );
    } else if ((c1 & 0xF800) != 0xD800) {
      enc = String.fromCharCode(
        (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    } else {
      // surrogate pairs
      if ((c1 & 0xFC00) != 0xD800) {
        throw new RangeError('Unmatched trail surrogate at ' + n);
      }
      var c2 = string.charCodeAt(++n);
      if ((c2 & 0xFC00) != 0xDC00) {
        throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
      }
      c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
      enc = String.fromCharCode(
        (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.slice(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
  }

  if (end > start) {
    utftext += string.slice(start, stringl);
  }

  return utftext;
}

function md5(str) {
  //  discuss at: http://phpjs.org/functions/md5/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Michael White (http://getsprink.com)
  // improved by: Jack
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //    input by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //  depends on: utf8_encode
  //   example 1: md5('Kevin van Zonneveld');
  //   returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'

  var xl;

  var rotateLeft = function (lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  };

  var addUnsigned = function (lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  };

  var _F = function (x, y, z) {
    return (x & y) | ((~x) & z);
  };
  var _G = function (x, y, z) {
    return (x & z) | (y & (~z));
  };
  var _H = function (x, y, z) {
    return (x ^ y ^ z);
  };
  var _I = function (x, y, z) {
    return (y ^ (x | (~z)));
  };

  var _FF = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _GG = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _HH = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _II = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var convertToWordArray = function (str) {
    var lWordCount;
    var lMessageLength = str.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = new Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };

  var wordToHex = function (lValue) {
    var wordToHexValue = '',
      wordToHexValue_temp = '',
      lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  };

  var x = [],
    k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22,
    S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20,
    S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23,
    S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  str = utf8_encode(str);
  x = convertToWordArray(str);
  a = 0x67452301;
  b = 0xEFCDAB89;
  c = 0x98BADCFE;
  d = 0x10325476;

  xl = x.length;
  for (k = 0; k < xl; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

  return temp.toLowerCase();
}

sprintfWrapper = {

 	init : function () {

 		if (typeof arguments == "undefined") { return null; }
 		if (arguments.length < 1) { return null; }
 		if (typeof arguments[0] != "string") { return null; }
 		if (typeof RegExp == "undefined") { return null; }

 		var string = arguments[0];
 		var exp = new RegExp(/(%([%]|(\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g);
 		var matches = new Array();
 		var strings = new Array();
 		var convCount = 0;
 		var stringPosStart = 0;
 		var stringPosEnd = 0;
 		var matchPosEnd = 0;
 		var newString = '';
 		var match = null;

 		while (match = exp.exec(string)) {
 			if (match[9]) { convCount += 1; }

 			stringPosStart = matchPosEnd;
 			stringPosEnd = exp.lastIndex - match[0].length;
 			strings[strings.length] = string.substring(stringPosStart, stringPosEnd);

 			matchPosEnd = exp.lastIndex;
 			matches[matches.length] = {
 				match: match[0],
 				left: match[3] ? true : false,
 				sign: match[4] || '',
 				pad: match[5] || ' ',
 				min: match[6] || 0,
 				precision: match[8],
 				code: match[9] || '%',
 				negative: parseInt(arguments[convCount]) < 0 ? true : false,
 				argument: String(arguments[convCount])
 			};
 		}
 		strings[strings.length] = string.substring(matchPosEnd);

 		if (matches.length == 0) { return string; }
 		if ((arguments.length - 1) < convCount) { return null; }

 		var code = null;
 		var match = null;
 		var i = null;

 		for(var i=0; i<matches.length; i++) {

 			if (matches[i].code == '%') { substitution = '%' }
 			else if (matches[i].code == 'b') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
 				substitution = sprintfWrapper.convert(matches[i], true);
 			}
 			else if (matches[i].code == 'c') {
 				matches[i].argument = String(String.fromCharCode(parseInt(Math.abs(parseInt(matches[i].argument)))));
 				substitution = sprintfWrapper.convert(matches[i], true);
 			}
 			else if (matches[i].code == 'd') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
 				substitution = sprintfWrapper.convert(matches[i]);
 			}
 			else if (matches[i].code == 'f') {
 				matches[i].argument = String(Math.abs(parseFloat(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
 				substitution = sprintfWrapper.convert(matches[i]);
 			}
 			else if (matches[i].code == 'o') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
 				substitution = sprintfWrapper.convert(matches[i]);
 			}
 			else if (matches[i].code == 's') {
 				matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length)
 				substitution = sprintfWrapper.convert(matches[i], true);
 			}
 			else if (matches[i].code == 'x') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
 				substitution = sprintfWrapper.convert(matches[i]);
 			}
 			else if (matches[i].code == 'X') {
 				matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
 				substitution = sprintfWrapper.convert(matches[i]).toUpperCase();
 			}
 			else {
 				substitution = matches[i].match;
 			}

 			newString += strings[i];
 			newString += substitution;

 		}
 		newString += strings[i];

 		return newString;

 	},

 	convert : function(match, nosign){
 		if (nosign) {
 			match.sign = '';
 		} else {
 			match.sign = match.negative ? '-' : match.sign;
 		}
 		var l = match.min - match.argument.length + 1 - match.sign.length;
 		var pad = new Array(l < 0 ? 0 : l).join(match.pad);
 		if (!match.left) {
 			if (match.pad == "0" || nosign) {
 				return match.sign + pad + match.argument;
 			} else {
 				return pad + match.sign + match.argument;
 			}
 		} else {
 			if (match.pad == "0" || nosign) {
 				return match.sign + match.argument + pad.replace(/0/g, ' ');
 			} else {
 				return match.sign + match.argument + pad;
 			}
 		}
 	}
 }
sprintf = sprintfWrapper.init;

var Jaf = {
    version : '1.0',
	backup  : new Array(),
	timer   : new Array(),
	tailleEcranPossible : {has800:800,has1024:1024,has1280:1260,has1600:1600,has1920:1920},
	widthScreenbody:0,
    init : function () {
        
        Jaf.LAN_CODE = localStorage.getItem('LAN_CODE') ;
        /*
        if (typeOf tinymceConfDefaut != "undefined") {
            tinymceConfDefaut.language = Jaf.LAN_CODE== 'FR' ? 'fr_FR' : 'en_GB';
        }
        */
        if (!Jaf.LAN_CODE ) {
            Jaf.LAN_CODE = LAN_CODE_DEFAULT;
        }
        if (! Jaf.currencySymbol ) {
            Jaf.currencySymbol = currencySymbol ? currencySymbol : '€';
        }
        Jaf.log('LAN_CODE='+Jaf.LAN_CODE);
        if ( $.datepicker.regional[ Jaf.LAN_CODE.toLowerCase() ] ) {
            setTimeout(function () {
                var settingLangue = $.datepicker.regional[ Jaf.LAN_CODE.toLowerCase() ];
                settingLangue.dateFormat = formatDate == 'anglais' ? 'mm/dd/yy' : 'dd/mm/yy';
                $.datepicker.setDefaults( settingLangue );
            },1000);
        } 
        if ( Jaf.dico[ Jaf.LAN_CODE ]) {
            Jaf.translateHtml( $('#conteneur') );
            Jaf.translateHtml( $('#messages') );
        }
    },
    traduitBody : function () {
        
    },
    isMobile : function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check; 
    },
    env : {
        get : function(name) {
            return Jaf.env[name] ? Jaf.env[name] : null;
        },
        set : function(name,value) {
            Jaf.env[name] = value;
            return Jaf.env;
        },
        add : function(obj) {
            for(var i in obj) {
                Jaf.env[i] = obj[i];
            }
        }
    },
	defineScreen : function () {
		var body=$('body');
		if ( Jaf.widthScreenbody==0) {
			$(window).unbind('resize').resize(function () {Jaf.defineScreen()});
		}
		Jaf.widthScreenbody = body.width();
		var classeScreen='has800';
		for(var  i in Jaf.tailleEcranPossible) {
			if ( Jaf.tailleEcranPossible[i] <= Jaf.widthScreenbody ) {
				classeScreen=i;
			}
			body.removeClass(i);
		}
		body.addClass(classeScreen);
		//Jaf.log('résolution ecran width='+Jaf.widthScreenbody+',class='+classeScreen);
		
	},
    fullscreen : {
        //met un element portant l'id en mode plein ecran
        openById : function (id) {
        	window.fullScreenApi.requestFullScreen(document.getElementById(id));
        },
        initEffect : function () {
            if ( !Jaf.fullscreen.installed ) {
                var fullScreenApi = { 
                        supportsFullScreen: false,
                        isFullScreen: function() { return false; }, 
                        requestFullScreen: function() {}, 
                        cancelFullScreen: function() {},
                        fullScreenEventName: '',
                        prefix: ''
                    },
                    browserPrefixes = 'webkit moz o ms khtml'.split(' ');
                
                // check for native support
                if (typeof document.cancelFullScreen != 'undefined') {
                    fullScreenApi.supportsFullScreen = true;
                } else {	 
                    // check for fullscreen support by vendor prefix
                    for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
                        fullScreenApi.prefix = browserPrefixes[i];
                        
                        if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                            fullScreenApi.supportsFullScreen = true;
                            
                            break;
                        }
                    }
                }
                
                // update methods to do something useful
                if (fullScreenApi.supportsFullScreen) {
                    fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
                    
                    fullScreenApi.isFullScreen = function() {
                        switch (this.prefix) {	
                            case '':
                                return document.fullScreen;
                            case 'webkit':
                                return document.webkitIsFullScreen;
                            default:
                                return document[this.prefix + 'FullScreen'];
                        }
                    }
                    fullScreenApi.requestFullScreen = function(el) {
                        return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
                    }
                    fullScreenApi.cancelFullScreen = function(el) {
                        return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
                    }		
                }

                // jQuery plugin
                if (typeof jQuery != 'undefined') {
                    jQuery.fn.requestFullScreen = function() {
                
                        return this.each(function() {
                            var el = jQuery(this);
                            if (fullScreenApi.supportsFullScreen) {
                                fullScreenApi.requestFullScreen(el);
                            }
                        });
                    };
                }

                // export api
                window.fullScreenApi     = fullScreenApi;	
                Jaf.fullscreen.installed = true;
            }
        }
    },
    ContrainteSelect : {
		tabCS : new Array(),
		tabPCS : new Array(),

		// ajoute une contrainte sur des listes déroulantes
		add: function ( nom , param ) {
			var tab = new Array();
			for(var i=0;i<param.listeChamp.length;i++) {
				tab[param.listeChamp[i]] = i+1;
			}
			param.listeChampNiveau = tab;
			this.tabCS[nom] = param;
		},
		getNoeudArray : function (n,tab,niveau,id) {
			if (n==niveau) {
				return tab[id]; 
			} else {
				var i=0;
				for(var i in tab) {
					var t = this.getNoeudArray(n+1,tab[i],niveau,id);
					if (t != null) {
						this.tabPCS[n] = i;
						return t;
					}
				}
				return null;
			}
		},
		consListeParNiveau : function (noeud,niveau) {
			if (noeud!=1) {
				for(var n in noeud) {
					if (this.listeParNiveau[niveau]==null) {
						this.listeParNiveau[niveau] = new Array();
					}
					this.listeParNiveau[niveau][n]=1; //.push(n);
					this.consListeParNiveau(noeud[n],niveau+1);
				}
			}
		},
		// applique la contrainte aux listes déroulantes
		appliqueContrainte : function (champ , nom) {
			this.tabPCS = new Array();
			var conf     = this.tabCS[nom];
			var id       = champ.val();
			var nomChamp = champ.attr('name');
			var niveau   = conf.listeChampNiveau[nomChamp];
			if (id.length==0) {
				niveau--;
				id =   $('#'+nom).find('select[name="'+conf.listeChamp[niveau-1]+'"]').val();
				var noeud    = this.getNoeudArray(1,conf.contrainte,niveau,id);
			} else {
				var noeud    = this.getNoeudArray(1,conf.contrainte,niveau,id);
				//positionne les listes parentes
				for(var n in this.tabPCS) {
					$('#'+nom).find('select[name="'+conf.listeChamp[n-1]+'"]').val(this.tabPCS[n]);
				}
			}
			// positionne les listes filles
			this.listeParNiveau = new Array();
			this.consListeParNiveau(noeud,niveau);
			
			for(var n=niveau;n<conf.listeChamp.length;n++) {
				if (n==niveau) {
					  $('#'+nom).find('select[name="'+conf.listeChamp[n]+'"]').parent().slideDown();
				}
				selectAffiche = $('#'+nom).find('select[name="'+conf.listeChamp[n]+'"]');
				var tab       = this.listeParNiveau[n];
				var obj       = selectAffiche.find('option:last');
				var tbackup   = Jaf.backup[conf.listeChamp[n]];
				//tbackup.sort();
				for(var  id in tbackup) {
					var chaine = Jaf.backup[conf.listeChamp[n]][id];
					if ( tab[ id ] == 1 ) {
						obj.after($('<option value="'+id+'">'+chaine+'</option>'));
						delete tbackup[id];
					}
				}
				selectAffiche.find('option').each(function () {
					if ( $(this).val() > 0 && tab[ $(this).val() ] == null ) {
						$(this).detach();
						tbackup[$(this).val()]=$(this).html();
					}
				});
			}
		},
		
		// initialise l'effet des contraintes sur des listes déroulantes
		initEffect : function ( nom , param ) {
			monForm = $('#'+nom);
            if (param.listeChamp) {
                for(var  i in param.listeChamp ) {
                    nomChamp = param.listeChamp[i];
                    monChamp = monForm.find('select[name="'+nomChamp+'"]');
                    if (i>0) {
                        Jaf.backup[nomChamp] = new Array();
                    }
                    monChamp.change( function () {
                        Jaf.ContrainteSelect.appliqueContrainte($(this),nom);
                    });
                    

                }
                if (monChamp.val() > 0) {
                    Jaf.ContrainteSelect.appliqueContrainte(monChamp,nom);
                }
            }
		}
	},
	MegaSelect : {
		faitDisparaitre : function(nomChamp,temps) {
			//alert(Jaf.timer[nomChamp]-temps);
			if ( temps >= Jaf.timer[nomChamp] ) {
				$('#infoBulle'+nomChamp).children().hide();
				$('select[name='+nomChamp+']').focus();
			}
		},
		keyup : function(nomChamp,e,force) {
			
			var moninput = $('#inputinfobulle'+nomChamp);
			var select   = $('#'+nomChamp);
			var listeUl  = moninput.next();
			Jaf.timer[nomChamp] = e.timeStamp;
			$('#infoBulle'+nomChamp).children().show();
			moninput.focus();
			if ( e.keyCode==40 ) {
				if (listeUl.has('li.selected').length) {
					var li = listeUl.find('li.selected');
					li.removeClass('selected');
					li.next().addClass('selected');
				} else {
					listeUl.find('li:first').addClass('selected');
				}
			}
			if ( e.keyCode==38 ) {
				if (listeUl.has('li.selected').length) {
					var li = listeUl.find('li.selected');
					li.removeClass('selected');
					li.prev().addClass('selected');
				} else {
					listeUl.find('li:last').addClass('selected');
				}
			}
			if ( ! (e.which==38 ||  
				 e.which==40)  ) {
				listeUl.html('');
				if (force) {
					moninput.val(moninput.val()+String.fromCharCode(e.which));
				}
				var machaine = moninput.val().toUpperCase();
				var expression = new RegExp('('+machaine+')',"ig");
				var nombre=0;
				select.find('option').each(function (){
					if (nombre<20) {
						var chaine = $(this).html();
						if ( expression.test( chaine ) ) {
							listeUl.append('<li rel="'+$(this).val()+'">'+chaine.replace(expression,'<span class="surligne">$1</span>')+'</li>');
							nombre++;
						}
					}
				});
				listeUl.find('li:first').addClass('selected');
			}
			if (listeUl.has('li.selected').length) {
					var li = listeUl.find('li.selected');
					select.val(li.attr('rel'));
			}
			setTimeout("Jaf.MegaSelect.faitDisparaitre('"+nomChamp+"','"+e.timeStamp+"')",2000);
		},
		initEffect : function (id) {
			$(id).each(function () {
				//pour plus de 15 elements dans la liste
				if ( $(this).find('option').length > 15) {
					var nomChamp = $(this).attr('name');
					var inputinfobulle = $('<input type="text" value="" id="inputinfobulle'+nomChamp+'" rel="'+nomChamp+'">');
					var infobulle = $('<div class="MegaSelectInfobulle" id="infoBulle' + nomChamp + '">'
									+ '<div class="zoneAffichable ui-widget ui-widget-content ui-corner-all"></div></div>');
					infobulle.children().append(inputinfobulle);
					infobulle.children().append($('<ul></ul>'));
					$(this).after(infobulle);
					
					$(this).keypress(function(e) {
						Jaf.MegaSelect.keyup($(this).attr('name'),e,true);
					});
					
					$(inputinfobulle).keyup(function(e) {
						Jaf.MegaSelect.keyup($(this).attr('rel'),e,false);
					});
				}
			});
		}
	},
	
	iframe : {
	    tab : new Array(),
		setClass_Aux : function (class_ou_id,classe) {
			$(class_ou_id).each(function () {
				$(this).contents().find('body').addClass(classe); 
			});
		},
		setClass : function (class_ou_id,classe) {
			Jaf.iframe.tab[class_ou_id] = classe;
		},
		initEffect : function () {
			for(var  class_ou_id in Jaf.iframe.tab ) {
				Jaf.iframe.setClass_Aux(class_ou_id,Jaf.iframe.tab[class_ou_id]);
			}
		}
	},
	
	FormulaireFichier : {
		createEffect : function (obj) {
            var obj      = $(obj).first();
            if (obj.length>0) {
                var name     = obj.attr('name');
                var id       = obj.attr('id');
                var nbmax    = obj.attr('valeurMax');
                var value    = obj.val();
                if ( !value) value='';
                var row_id   = obj.data('row_id');
                var old_file = '';
                if ( value.indexOf('|') > -1 ) {
                    var tab = value.split('|');
                    value    = tab[0];
                    old_file = tab[1];
                }
                var isOnBop  = ( Jaf.Bop3.isOnBop ? '1' : '0' );
                var params = {
                        files     : value,
                        old_file  : old_file,
                        nomChamp  : name,
                        isOnBop   : isOnBop,
                        row_id    : row_id,
                        idChamp   : id
                }
                
                $('#uploadFichierAjout'+id).remove();
                var lienAjout= $('<div id="uploadFichierAjout'+id+'" class="uploadFichierAjout">+ '+Jaf.translate('Ajouter des fichiers~^FR~^Add files~^EN')+'</div>');
                for(var i in params) {
                    lienAjout.data(i,params[i]);
                }
                lienAjout.click(function() {
                    var files    = $(this).data('files');
                    var old_file = $(this).data('old_file');
                    var row_id   = $(this).data('row_id');
                    $.fancybox({
                        content    : '<iframe src="/tools/upload-fichier/getformfile?idChamp='+id+'&nomChamp='+name+'&file='+files+'&old_file='+old_file+'&row_id='+row_id+'" id="uploadFichier'+id+'" class="uploadFichierFrame" ALLOWTRANSPARENCY="true"></iframe>'
                    });
                   
                });
                if ( value.length>0) {
                    var t=value.split(';');
                    if ( t.length > nbmax ) {
                       lienAjout.addClass("uploadFichierHide");
                    }
                }
                obj.after(lienAjout);
                $.post('/tools/upload-fichier/load',params,function(data) {
                    $('#uploadFichierVue'+id).remove();
                    $(lienAjout).after('<div id="uploadFichierVue'+id+'" class="uploadFichierContenu">'+data+'</div>');
                });
                obj.hide();
            }
		},
        delete_file : function(obj,nomChamp) {
            var old_file     = $("#uploadFichierAjout"+nomChamp).data('old_file');
            var fichier_supp = obj.parent();
            if (!old_file) old_file='';
            old_file = ';'+fichier_supp.data('value')+old_file;
            fichier_supp.remove();  
            var files='';
            $("#uploadFichierVue"+nomChamp+" li").each(function () {
               files    += ';'+$(this).data('value');
            }); 
            $("#uploadFichierAjout"+nomChamp).data('old_file',old_file);
            if ( old_file.length>0 ) files +='|'+old_file;
            $('#'+nomChamp).val(files).change();
            return false;
        },
        remake_value : function(nomChamp) {
            var files = '';
            var file_old = $('#'+nomChamp).val();
            var pos      = file_old.indexOf('|');
            var old_file = '';
            if ( pos>-1 ) old_file = file_old.substring(pos);
            
            $("#uploadFichierVue"+nomChamp+" li").each(function () {
                files += ';'+$(this).data('value');
            }); 
            
            if ( old_file.length > 0 ) files+= old_files;
            
            $('#'+nomChamp).val(files).change();
            Jaf.FormulaireFichier.createEffect( $('#'+nomChamp) ); 
        },
		initEffect : function () {
			$('.formulaireFichier').each(function () {
				Jaf.FormulaireFichier.createEffect(this);
			});
		}

	},

	ListeChoixMultiple : {
        tabListe       : [],
        tabFunction    : [],
        tabPlaceholder : [],
        initEffect : function () {
            Jaf.ListeChoixMultiple.effect('.listeChoixMultiple');
        },
        init    : function(monId) {
            $('#'+monId).next().find('input[type=Checkbox]:checked').prop('checked',false);
            Jaf.ListeChoixMultiple.execute(monId);
        },
        execute : function(monId) {
            selecteur=$('#'+monId).first();
            var contenu='';
            Jaf.ListeChoixMultiple.tabListe[monId].find('input:checked').each(function() {
                contenu += ( contenu.length==0 ? '' : ', ' ) + $(this).next().html();
            });
            selecteur.html(contenu.length > 0 ? contenu : Jaf.ListeChoixMultiple.tabPlaceholder[monId] );
            if (monId in Jaf.ListeChoixMultiple.tabFunction) {
                Jaf.ListeChoixMultiple.tabFunction[monId](monId);
            }
        },
        effect : function (id_ou_class) {
            $( id_ou_class ).each(function () {
                var filtre      = $(this);
                var rads        = filtre.find('.rad');
                var first_rad   = rads.first();
                var placeholder = first_rad.find('label').first().html();
                var label       = filtre.find('.label').first();
                var nouv_label  = $('<label></label>').prop('class',label.prop('class')).html(label.html()).removeClass('label');
                label.replaceWith(nouv_label);
                var monId = 'lcm'+filtre.prop('id');
                var nouv_rads = $('<div class="row_rad_liste"></div>')
                                .html(rads)
                                .prepend('<a href="" class="jaf_ListeChoixMultiple_decocher" onclick="javascript:Jaf.ListeChoixMultiple.init(\''+monId+'\');return false;">Cliquez ici pour tout décocher</a>')
                                .mouseleave(function () {
                                    Jaf.ListeChoixMultiple.execute(monId);
                                    $(this).fadeOut(500);
                                }); 
                
                nouv_rads.find('input[value=""]').remove();
                Jaf.ListeChoixMultiple.tabPlaceholder[monId] = placeholder; 
                var selecteur = $('<div class="row_rad_liste_selecteur"></div>').prop('id',monId).html(placeholder).click(function () {
                    nouv_rads.fadeToggle(500,Jaf.ListeChoixMultiple.execute(monId)); 
                });
                Jaf.ListeChoixMultiple.tabListe[monId]=nouv_rads;
                nouv_label.after(selecteur);
                selecteur.after(nouv_rads);
                filtre.removeClass('row_rad').addClass('row').addClass('row_liste');
                Jaf.ListeChoixMultiple.execute(monId);
            });
            
        }
    },
	// permet de deplier "selecteur" et de changer le graphisme de l'objet qui a declencher l'evement en rajoutant les classes ouvrir ou fermer
	// exemple : Jaf.deplieZone(this,'#ma_div_a_ouvrir')
	deplieZone : function (obj,selecteur) {
	    $(selecteur).toggle(200,function(){ 
	        	if ( $(this).css('display') == 'none' ) {
	             	$(obj).removeClass('fermer');
	             	$(obj).addClass('ouvrir');
	             } else {
	            	$(obj).removeClass('ouvrir');
	             	$(obj).addClass('fermer');
	             }
	    });
	},
    traduction : function (valeur, langue) {
		if ( valeur && valeur.indexOf('~^')>-1) {
			var tmp = valeur.split('~^');
			var txt = tmp[0];
			for(var i=1; i<tmp.length; i+=2) { if (tmp[i] == langue && tmp[i-1].length > 0 ) { txt = tmp[i-1]; } }
			return(txt);
		} else {
			return valeur ? valeur : '';
		}
    },
	dateToMysql : function (date1) {
	  return date1.getFullYear() + '-' +
		(date1.getMonth() < 9 ? '0' : '') + (date1.getMonth()+1) + '-' +
		(date1.getDate() < 10 ? '0' : '') + date1.getDate();
	},
    getAjax_initEffect : function () {
        $('.jaf_getAjax').each( function () {
            $(this).click( function () {
                $.get($(this).attr('href'),function (data) {
                    eval(data);
                });
                return false;
            });
        });
    },
    z : {},
    getZone : function(nom) {
        return Jaf.z[nom];
    },
    setZone : function(nom,obj) {
        Jaf.z[nom] = obj;
    },
    initZone : function() {
        $('.jafZone').each(function() {
            Jaf.z[ $(this).attr('id') ] = $(this);
            $(this).removeClass('jafZone');
        });
    },
	zoneDeplie : {
	    anim : function ( obj ) {
			var monObjet = $(obj);
			if ( monObjet.data('position')=='ouvert' ) {
			    $('#'+monObjet.data('role')).hide();
				monObjet.data('position','');
			} else {
			    var temps  = monObjet.data('time')   ? monObjet.data('time')   : '0'; 
				if ( monObjet.data('easing') ) {
					$('#'+monObjet.data('role')).show(monObjet.data('easing'),temps);
				} else {
					$('#'+monObjet.data('role')).show(temps);
				}
				
				monObjet.data('position','ouvert');
			}
			var image_tmp = monObjet.attr('src');
			monObjet.attr('src',monObjet.data('image') ? monObjet.data('image') : image_tmp );
			monObjet.data('image',image_tmp);
		},
		initEffect : function (monid_maclass) {
			$(monid_maclass).click(function () {
				Jaf.zoneDeplie.anim(this);
			});
		}
	},
	getScrollPosition : function() {
		return {
			x : (document.documentElement && document.documentElement.scrollLeft) || window.pageXOffset || self.pageXOffset || ( document.body && document.body.scrollLeft),
		    y : (document.documentElement && document.documentElement.scrollTop) || window.pageYOffset || self.pageYOffset || ( document.body && document.body.scrollTop)
		}
	},
    /**
     * Arrondi avec décimales, comme round() en php
     * @param float val
     * @param int precision
     * @return float
     */
    roundDecimal : function(val, precision) { return Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision); },
	
	log : function(chaine) {
		if (window.console && window.console.log ) {
			console.log(chaine);
		}
	},
    debug : function (chaine) {
       
        $('#zoneDebug').append('<pre>'+chaine+'</pre>');
        Jaf.log(chaine);
    },
	chrono : function ( chaine , type ) {
		if ( type ) {
            if ( ! Jaf.tabStartTime ) {
                Jaf.tabStartTime={};
            }
            if ( ! Jaf.tabStartTime[type] ) {
                Jaf.tabStartTime[type]=new Date().getTime();  
            }
            maintenant = new Date().getTime();  
            console.log( type+' | '+chaine + ' : '+( maintenant - Jaf.tabStartTime[type] ) + ' ms' );
            Jaf.tabStartTime[type] = maintenant;
        } else {
            if ( ! Jaf.startTime ) {
                Jaf.startTime=new Date().getTime();  
            }
            maintenant = new Date().getTime();  
            console.log( chaine + ' : '+( maintenant - Jaf.startTime ) + ' ms' );
            Jaf.startTime = maintenant;
        }
    },	extend : function ( pere ) {
		var fils = {};
		$.extend(fils,pere,{parent : pere});
		return fils;
	},	
	date2mysql : function (d) {
        switch ( formatDate ) {
            case 'anglais' :
                if ( typeof d == 'object') {
                    return sprintf('%04d-%02d-%02d',d.getFullYear(),d.getMonth()+1,d.getDate());
                } else if (!isNaN( d ) ) {
                    var da = new Date(d);
                    return Jaf.date2mysql(da);
                } else if ( d.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/) ) {
                    return d;
                } else {
                    var tab=d.split('/');
                    return tab[2]+'-'+tab[0]+'-'+tab[1];
                }
            default :
                if ( typeof d == 'object') {
                    return sprintf('%04d-%02d-%02d',d.getFullYear(),d.getMonth()+1,d.getDate());
                } else if (!isNaN( d ) ) {
                    var da = new Date(d);
                    return Jaf.date2mysql(da);
                } else if ( d.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/) ) {
                    return d;
                } else {
                    var tab=d.split('/');
                    return tab[2]+'-'+tab[1]+'-'+tab[0];
                }
        }
	},
	date2mysqltime : function (d) {
        if ( typeof d == 'object') {
            return sprintf('%04d-%02d-%02d %02d:%02d:%02d',d.getFullYear(),d.getMonth()+1,d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds());
        } else {
            return 'format non reconnu='+d;
        }
	},
	mysql2date : function (d) {
		switch ( formatDate ) {
            case 'anglais' :
                if ( typeof d == 'object') {
                    return sprintf('%02d/%02d/%04d',d.getMonth()+1,d.getDate(),d.getFullYear());
                } else if ( typeof d =='number' ) {
                    var d=new Date(d);
                    return sprintf('%02d/%02d/%04d',d.getMonth()+1,d.getDate(),d.getFullYear());
                } else {
                    var tab=d.split('-');
                    return tab[1]+'/'+tab[2]+'/'+tab[0];
                }
            default :
                if ( typeof d == 'object') {
                    return sprintf('%02d/%02d/%04d',d.getDate(),d.getMonth()+1,d.getFullYear());
                } else if ( typeof d =='number' ) {
                    var d=new Date(d);
                    return sprintf('%02d/%02d/%04d',d.getDate(),d.getMonth()+1,d.getFullYear());
                } else {
                    var tab=d.split('-');
                    return tab[2]+'/'+tab[1]+'/'+tab[0];
                }
        }
	},
	getDate : function(chaine) {
		if ( typeof chaine == 'object') {
			return chaine;
		} else if ( chaine ) {
			switch ( formatDate ) {
                case 'anglais' :  
                if( tab=chaine.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/) ) {
                    // 2013-01-31
                    var d = new Date( tab[1] , tab[2]-1 , tab[3] );
                } else if( tab=chaine.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01]) ([0-5][0-9]):([0-5][0-9]):([0-5][0-9])$/) ) {
                    // 2013-01-31 15:30:00
                    var d = new Date( tab[1] , tab[2]-1 , tab[3] , tab[4] , tab[5] , tab[6] );
                } else if( tab=chaine.match(/^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/([0-9]{4})$/) ) {
                    // 31/01/2013
                    var d = new Date( tab[3] , tab[1]-1 , tab[2] );
                } else if( tab=chaine.match(/^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/([0-9]{4}) ([0-5][0-9]):([0-5][0-9]):([0-5][0-9])$/) ) {
                    // 31/01/2013
                    var d = new Date( tab[3] , tab[1]-1 , tab[2] , tab[4] , tab[5] , tab[6]  );
                } else if( tab=chaine.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])T([0-5][0-9]):([0-5][0-9]):([0-5][0-9])/) ) {
                    // 2013-03-14T12:20:00
                    var d = new Date( tab[3] , tab[2]-1 , tab[1] , tab[4] , tab[5] , tab[6]  );
                } else {
                    var d = false;
                }
                return d;
                
                default : 
                if( tab=chaine.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/) ) {
                    // 2013-01-31
                    var d = new Date( tab[1] , tab[2]-1 , tab[3] );
                } else if( tab=chaine.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01]) ([0-5][0-9]):([0-5][0-9]):([0-5][0-9])$/) ) {
                    // 2013-01-31 15:30:00
                    var d = new Date( tab[1] , tab[2]-1 , tab[3] , tab[4] , tab[5] , tab[6] );
                } else if( tab=chaine.match(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/([0-9]{4})$/) ) {
                    // 31/01/2013
                    var d = new Date( tab[3] , tab[2]-1 , tab[1] );
                } else if( tab=chaine.match(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/([0-9]{4}) ([0-5][0-9]):([0-5][0-9]):([0-5][0-9])$/) ) {
                    // 31/01/2013
                    var d = new Date( tab[3] , tab[2]-1 , tab[1] , tab[4] , tab[5] , tab[6]  );
                } else if( tab=chaine.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])T([0-5][0-9]):([0-5][0-9]):([0-5][0-9])/) ) {
                    // 2013-03-14T12:20:00
                    var d = new Date( tab[3] , tab[2]-1 , tab[1] , tab[4] , tab[5] , tab[6]  );
                } else {
                    var d = false;
                }
                return d;
            }
			
		} else 
			return false;
	},
	//renvoi le nombre de seconde dans la journée 
	getTemps : function(value) {
		if ( value && value.indexOf(':')>0 ) {
			var tab=value.split(':');
			return  1*tab[0]*3600 +1*tab[1]*60 +( tab[2]>0 ? 1*tab[2] : 0 );
		} else {
			return 0;
		}
	},
	time2mysql : function(chaine) {
		if ( chaine.length==0) {
            return '';
        }
        switch ( formatDate ) {
            case 'anglais' :
                if ( chaine.match(/^([0-9]{4})$/) ) {
                    return chaine.substr(0,2)+':'+chaine.substr(2,4)+':00';
                } else if ( chaine.match(/^([0-9]{2}):([0-9]{2})am$/) ) {
                    var hours = chaine.substr(0,2);
                    return (hours=='12' ? '00' : hours ) + ':' + chaine.substr(3,2) + ':00';
                } else if ( chaine.match(/^([0-9]{2}):([0-9]{2})pm$/) ) {
                    var hours = chaine.substr(0,2);
                    return ( hours == '12' ? hours : hours*1 + 12 )+':'+chaine.substr(3,2)+':00';
                } else if ( chaine.match(/^([0-9]{2}):([0-9]{2})$/) ) {
                    return chaine.substr(0,2)+':'+chaine.substr(3,5)+':00';
                }else if( tab=chaine.match(/^([0-2][0-9]|[0-9]):([0-5][0-9]):([0-5][0-9])$/) ) {
                    // 15:25:00
                    return chaine;
                } else if( tab=chaine.match(/^([0-2][0-9]|[0-9]):([0-5][0-9])$/) ){
                    // 15h25
                    return tab[1]+':'+tab[2]+':00';
                }
            default : 
                if ( chaine.match(/^([0-9]{4})$/) ) {
                    return chaine.substr(0,2)+':'+chaine.substr(2,4)+':00';
                } else if ( chaine.match(/^([0-9]{2})h([0-9]{2})$/) ) {
                    return chaine.substr(0,2)+':'+chaine.substr(3,2)+':00';
                }else if( tab=chaine.match(/^([0-2][0-9]|[0-9]):([0-5][0-9]):([0-5][0-9])$/) ) {
                    // 15:25:00
                    return chaine;
                } else if( tab=chaine.match(/^([0-2][0-9]|[0-9]):([0-5][0-9])$/) ){
                    // 15:25
                    return chaine+':00';
                }
        }
		return false;
	},
	moisLong  : {
        'FR' :  ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
        'EN' :  ['January','February','March','April','May','June','July','August','September','October','November','December']
    },
	moisCours : {
        'FR': ['Jan','Fév','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'],
        'EN': ['Jan','Feb','Mars','Apr','May','June','July','Augu','Sept','Oct','Nov','Dec'],
    },
	jourLong  : {
        'FR' : ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
        'EN' : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    },
	jourCours : {
        'FR' : ['D','L','M','M','J','V','S'],
        'EN' : ['S','M','T','W','T','F','S']
    },
	jourMoyen : {
        'FR' : ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
        'EN' : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    },
    dico      : {},
	// permet de créer un heritage d'un objet avec comme propriete .parent l'objet initial afin de relancer les méthodes et propriétées du parent
	
	translate : function (chaine) {
		if (chaine ) {
            if ( chaine.substr(0,1) == '%' && chaine.substr( chaine.length-1,1) == '%' ) {
                return Jaf.translate( chaine.substr( 1, chaine.length-2 ) );
            } else if ( chaine.indexOf('~^')>0) {
                var tmp = chaine.split('~^');
                for(var i=1;i<tmp.length;i=i+2) {
                    if ( tmp[i]==Jaf.LAN_CODE ) {
                        return tmp[i-1];
                    }
                }
                return 'Erreur de traduction';
            } else {
                if ( Jaf.dico[Jaf.LAN_CODE] && Jaf.dico[Jaf.LAN_CODE][ chaine ] ) {
                    return Jaf.dico[Jaf.LAN_CODE][ chaine ];
                } else {
                    
                    return LAN_CODE_DEFAULT && Jaf.dico[LAN_CODE_DEFAULT] && Jaf.dico[LAN_CODE_DEFAULT][ chaine ] ? Jaf.dico[LAN_CODE_DEFAULT][ chaine ] : chaine ;
                }
            }
        }
        return '';
	},
    translateHtml : function(body){
        var flag_obj = false;
        if ( typeof body == 'object' && body.jquery ) {
            var monHtml = body.html();
            flag_obj = true;
        } else {
            var monHtml = body;
        }
        if (monHtml) {
            var le      = monHtml.match(/(%[A-Z_0-9]+%)/gi);
            var lc      = {};
            for (var i in le) { lc[ le[i] ] = 1};
            
            if ( le && le.length > 0 ) {
                if ( flag_obj ) {
                    body.find('input[type=text],textarea').each(function () {
                        var value = $(this).val();
                        if ( value.substr(0,1)=='%' &&  value.substr(value.length-1,1)=='%') {
                            $(this).attr('data-namecle', value.substr(1, value.length-2) );
                        }
                    });
                    monHtml = body.html();
                }
                //Jaf.log(monHtml);
                var dico    = Jaf.dico[ Jaf.LAN_CODE ];
                for(var i in lc ) {
                    var cle = i.substr(1,i.length-2);
                    if ( dico[ cle ] ) {
                        monHtml = monHtml.replace(new RegExp( i , 'g') , dico[ cle ] ? dico[ cle ] : Jaf.dico[ LAN_CODE_DEFAULT ][ cle ] );
                    }
                }
                if ( flag_obj ) {
                    body.html( monHtml );
                    body.find('input[data-namecle],textarea[data-namecle]').each(function () {
                         $(this).val( '%'+$(this).attr('data-namecle')+'%' );
                    });
                }
            }
            return monHtml;
        }
    },
    loadDictionnaire : function(lan_code,dictionnaire){
        if ( !Jaf.dico[lan_code] ) {
            Jaf.dico[lan_code] = dictionnaire;
        } else {
            $.extend(Jaf.dico[ lan_code ] , dictionnaire );
        }
    },
	toUpperCaseSansAccent : function(str) {
		if ( str ) {
            var accent = [
                /[\300-\306]/g, /[\340-\346]/g, // A, a
                /[\310-\313]/g, /[\350-\353]/g, // E, e
                /[\314-\317]/g, /[\354-\357]/g, // I, i
                /[\322-\330]/g, /[\362-\370]/g, // O, o
                /[\331-\334]/g, /[\371-\374]/g, // U, u
                /[\321]/g, /[\361]/g, // N, n
                /[\307]/g, /[\347]/g // C, c
               
            ];
            var noaccent = ['A','A','E','E','I','I','O','O','U','U','N','N','C','C'];
             
            for(var i = 0; i < accent.length; i++){
                str = str.replace(accent[i], noaccent[i]);
            }
             
            return str.toUpperCase();;
        } else return ''; 
	},
	onlyAZ : function(str) {
		if ( str ) {
            var accent = [
                /[\300-\306]/g, /[\340-\346]/g, // A, a
                /[\310-\313]/g, /[\350-\353]/g, // E, e
                /[\314-\317]/g, /[\354-\357]/g, // I, i
                /[\322-\330]/g, /[\362-\370]/g, // O, o
                /[\331-\334]/g, /[\371-\374]/g, // U, u
                /[\321]/g, /[\361]/g, // N, n
                /[\307]/g, /[\347]/g // C, c
               
            ];
            var noaccent = ['A','A','E','E','I','I','O','O','U','U','N','N','C','C'];
             
            for(var i = 0; i < accent.length; i++){
                str = str.replace(accent[i], noaccent[i]);
            }
            var res='';
            str = str.toUpperCase();            
            for(var i = 0; i < str.length; i++) {
                var nc = str[i].charCodeAt();
                if ( nc >= 65 && nc<= 90 ) res+=str[i];
            }
            return res;
        } else return ''; 
	},
	comparePureTexte : function (s1,s2) { 
		s1 = s1 ? Jaf.onlyAZ(s1) : '';
		return s2 ? s1.indexOf( Jaf.onlyAZ(s2) ) > -1 : false; 
	},
	compareTexte : function (s1,s2) { 
		s1 = s1 ? Jaf.toUpperCaseSansAccent(s1) : '';
		return s2 ? s1.indexOf( Jaf.toUpperCaseSansAccent(s2) ) > -1 : false; 
	},
	formatValue : {
		Montant : function(value,symbol) {
		    if ( !symbol) var symbol = Jaf.currencySymbol;
            if ( !value ) {
				return '';
			}
			switch (symbol) {
                case '$' : 
                    var millier = Math.floor(value/1000);
                    var unite   = Math.floor(value - 1000 * millier);
                    var centime = Math.round( ( value - ( 1000 * millier + unite ) ) * 100 , 2 );
                    return '$ ' + ( millier > 0 ? sprintf('%d,%03d.%02d' , millier , unite , centime ) : sprintf('%d.%02d' , unite , centime ) ) ;
                default:
                return sprintf('%.2f',value)+' '+symbol;
            }
		},
		Pourcentage : function(value) {
		    if ( !value ) {
				return '';
			}
			return sprintf('%.2f',value)+' %';
		},
        Heure_internationnale : function(hours,minutes) {
            if ( formatHeure && formatHeure == 'anglais') {
                var ampm = hours >= 12 ? 'pm' : 'am';
                hours    = hours % 12;
                hours    = hours ? hours : 12; // the hour '0' should be '12'
                //minutes  = minutes < 10 ? '0'+minutes : minutes;
                return sprintf( '%02d:%02d' ,  hours , minutes ) + ' ' + ampm;
            } else {
                return sprintf( '%02d:%02d' , hours ,minutes );
            }
        },
        Temps   : function ( value ) {
            if ( typeof value=='string' ) {
                var hours   = value.substr(0,2);
                var minutes = value.substr(3,2);
            } else if (typeof value=='number') {
                var value   = Math.round( value/60)*60;
                var hours   = Math.floor( value/3600 );
                var minutes = ( value - hours*3600 ) / 60;
            }
            if ( formatHeure && formatHeure == 'anglais') {
                return sprintf( '%02d:%02d' , hours , minutes ) ;
            } else {
                return sprintf( '%02dh%02d' , hours , minutes );
            }
        },
		Heure   : function(value) {
			if ( value ) {
                if (typeof value=='object') {
                        return Jaf.formatValue.Heure_internationnale( value.getHours() , value.getMinutes() );
                } else if ( typeof value=='string' ) {
                    if ( value.indexOf(':') > 0 ) {
                        var tab = value.split(':');
                        return Jaf.formatValue.Heure_internationnale( tab[0] , tab[1] );
                    }else if ( value.indexOf('h')>0 ) {
                        var tab = value.split('h');
                        return Jaf.formatValue.Heure_internationnale( tab[0] , tab[1] );
                    }
                } else if (typeof value=='number') {
                    if  ( value < 0 ) {
                        var heure  = Math.floor(value-0.001)+1;
                        var minute = Math.round( value * 60 - heure * 60 );
                        return Jaf.formatValue.Heure_internationnale( heure, 0-minute  );
                    } else {
                        var heure  = Math.floor(value);
                        var minute = Math.round( value * 60 - heure * 60 );
                        return Jaf.formatValue.Heure_internationnale( heure, minute  );
                    }
                } else {  
                    Jaf.log('probleme formatValue.Heure('+value+')');                
                    return '??';
                }
            } else {                    
                return '';
            }

		},
		Date_Texte  : function(d) {
		    if ( d==null) {
				return '';
			}
            if ( !isNaN( d ) ) d = new Date( d );
			if (typeof d=='object') {
				if ( formatDate=='anglais' ) {
                    return sprintf( '%s %dth %s', Jaf.jourLong[ Jaf.LAN_CODE ][ d.getDay() ] , d.getDate() , Jaf.moisLong[ Jaf.LAN_CODE ][ d.getMonth()] );
                } else {
                    return sprintf( '%s %d %s'  , Jaf.jourLong[ Jaf.LAN_CODE ][ d.getDay() ] , d.getDate() , Jaf.moisLong[ Jaf.LAN_CODE ][ d.getMonth()] );
                }
			} else {
				return Jaf.formatValue.Date_Texte( Jaf.getDate(d) );
			}
		},
		Date    : function(d) {
		    if ( d==null) {
				return '';
			}
            if ( !isNaN( d ) ) d = new Date( d );
			if (typeof d=='object') {
				return  formatDate=='anglais' ? sprintf( '%02d/%02d/%04d'  ,d.getMonth()+1, d.getDate() , d.getFullYear() ) : sprintf( '%02d/%02d/%04d' , d.getDate() ,d.getMonth()+1 , d.getFullYear() );
			} else {
				if ( d && d.indexOf('-')>0 ) {
					var tab=d.split('-');
					return formatDate=='anglais'? tab[1]+'/'+tab[2]+'/'+tab[0] : tab[2]+'/'+tab[1]+'/'+tab[0];
				} else {
					return '';
				}
			}
		},
        Datetime : function(d) {
		    if ( d==null) {
				return '';
			}
            if ( !isNaN( d ) ) d = new Date( d );
			if (typeof d=='object') {
				return  formatDate=='anglais' ? sprintf( '%02d/%02d/%04d %02d:%02d'  ,d.getMonth()+1, d.getDate() , d.getFullYear(), d.getHours(),d.getMinutes() ) : sprintf( '%02d/%02d/%04d %02dh%02d' , d.getDate() ,d.getMonth()+1 , d.getFullYear() , d.getHours(),d.getMinutes());
			} else {
				if ( d && d.indexOf('-')>0 ) {
					tab=d.match(/^([0-9]{4})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01]) ([0-5][0-9]):([0-5][0-9]):([0-5][0-9])$/);
                    return formatDate=='anglais'? tab[2]+'/'+tab[3]+'/'+tab[1]+' '+tab[4]+':'+tab[5] : tab[3]+'/'+tab[2]+'/'+tab[1]+' '+tab[4]+'h'+tab[5];
				} else {
					return '';
				}
			}
		},        Telephone : function(tel) {
            tel = tel.replace(new RegExp(/[ ._-]/g),'');
            return tel;
        },
        Km : function (value,format) {
            return sprintf(format ? format : '%0.1f', ( metricLocale == 'mi' ? 0.62137 * value : value ) ) + ' ' + metricLocale;
        }
	},
    UnitDistanceToKm :function (value) {
        if ( value.length>0) {
            value = value.replace('km','');
            value = value.replace('mi','');
            return ( metricLocale == 'mi' ? ( 1 * value / 0.62137 ) : 1 * value ) ;
        } else {
            return 0;
        }
    },
	html2mysql : {
		Montant : function(value) {
		    if ( value == '') {
				return 0;
			}
			if ( Jaf.currencySymbol == '$' ) {
                value = value.replace(',','');
            }
            value = value.replace(',','.');
            value = value.replace(Jaf.currencySymbol,'');
            value = value.replace(' ','');
            return 1*value;
		}
	},
    valoriseFonction : {
		Texte     : function(z,nomChamp,value) {
            if ( z.find('input[name='+nomChamp+']:focus').length==0) {
                return z.find('input[name='+nomChamp+']').val(  value ? value : ''  );
            }
		},
		Quantite  : function(z,nomChamp,value) {
			if ( z.find('input[name='+nomChamp+']:focus').length==0) {
                return z.find('input[name='+nomChamp+']').val( value ? value : '' );
            }
		},
		Montant   : function(z,nomChamp,value) {
			if ( z.find('input[name='+nomChamp+']:focus').length==0) {
                return z.find('input[name='+nomChamp+']').val( Jaf.formatValue.Montant( value ? value : 0 ) );
            }
		},
		Textarea  : function(z,nomChamp,value) {
			if ( z.find('textarea[name='+nomChamp+']:focus').length==0) {
                return z.find('textarea[name='+nomChamp+']').val( value ? value : '' );
            }
		},
		HeureHtml : function(z,nomChamp,value) {
			return z.find('[data-role='+nomChamp+']').html( Jaf.formatValue.Heure(  value ? value : ''  ) );
		},
		DateHtml : function(z,nomChamp,value) {
			return z.find('[data-role='+nomChamp+']').html( Jaf.formatValue.Date(  value ? value : ''  ) );
		},
		TexteHtml : function(z,nomChamp,value) {
			return z.find('[data-role='+nomChamp+']').html(  value ? value : ''  );
		},
		Fichier   : function(z,nomChamp,value) {
			var champ = z.find('input[name='+nomChamp+']').first();
			if ( champ.length>0 ) {
				champ.val( value );
				if ( champ.data('status')!='effectOn' ) {
					champ.data('status','effectOn' );
					Jaf.FormulaireFichier.createEffect( champ );
				} 
			}	
			return champ;
		},
		Select    : function(z,nomChamp,value) {
			return  value ? z.find('select[name='+nomChamp+']').val( value ) :  z.find('select[name='+nomChamp+']');
		},
		Tva       : function(z,nomChamp,value) {
			return z.find('select[name='+nomChamp+']').val( sprintf('%.2f',value ? value : 0) );
		},
		Options   : function(z,nomChamp,values) {
			z.find('select[name='+nomChamp+']').each(function() {
				var monselect = $(this);
				monselect.html();
				monselect.append( $('<option value="">...</option>') );
				for(var  i in values ) {
					monselect.append( $('<option value="'+i+'">'+values[i]+'</option>') );
				}
			});
		}
	},
	addRaccourci : function(caractere,mafonction) {
		var flag_control = false;
        if ( caractere.length==1 ) {
            var c = caractere.toUpperCase().charCodeAt(0);
           
        } else {
            var c = 1*caractere;
            flag_control=true; 
            
        }
        $('body').bind('keydown',function(e) {
			if ( ( flag_control || e.ctrlKey ) && e.keyCode == c ) {
				mafonction(e);
			}
		});
    },
    
    getStorage : function( name , par_defaut ) {
        var s       = localStorage.getItem( Jaf.cm.nameStorage +'.'+ name  );
        return s && s.length>0 ? JSON.parse(s) : ( par_defaut ? par_defaut : {} );
    },
    setStorage : function( name , objet ) {
        return localStorage.setItem( Jaf.cm.nameStorage +'.'+ name , JSON.stringify(objet) );
    }
}



Jaf.Class = function(name,options) {
   this.name = name;
   for(var i in options) {
        if ( this['set'+i.capitalizeFirstLetter()] ) {
            this['set'+i.capitalizeFirstLetter()](options[i]);
        } else {
            this[i] = options[i]; 
        } 
    }
    this.initialize && this.initialize();
}; 

Jaf.Class.extend = function(childPrototype) { 
    var parent           = this;
    var child            = function() { return parent.apply(this, arguments); };
    child.extend         = parent.extend;
    var Surrogate        = function() {}; 
    Surrogate.prototype = parent.prototype;
    child.prototype     = new Surrogate;
    for(var key in childPrototype){
        if (parent.prototype[key]) parent.prototype['parent_'+key] = parent.prototype[key];
        child.prototype[key] = childPrototype[key];
    }
    
    return child;
};