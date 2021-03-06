var Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function(e) {
   var t = "";
   var n, r, i, s, o, u, a;
   var f = 0;
   e = Base64._utf8_encode(e);
   while (f < e.length) {
    n = e.charCodeAt(f++);
    r = e.charCodeAt(f++);
    i = e.charCodeAt(f++);
    s = n >> 2;
    o = (n & 3) << 4 | r >> 4;
    u = (r & 15) << 2 | i >> 6;
    a = i & 63;
    if (isNaN(r)) {
     u = a = 64
    } else if (isNaN(i)) {
     a = 64
    }
    t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
   }
   return t
  },
  decode: function(e) {
   var t = "";
   var n, r, i;
   var s, o, u, a;
   var f = 0;
   e=e.replace(/[^A-Za-z0-9+/=]/g,"");
   while (f < e.length) {
    s = this._keyStr.indexOf(e.charAt(f++));
    o = this._keyStr.indexOf(e.charAt(f++));
    u = this._keyStr.indexOf(e.charAt(f++));
    a = this._keyStr.indexOf(e.charAt(f++));
    n = s << 2 | o >> 4;
    r = (o & 15) << 4 | u >> 2;
    i = (u & 3) << 6 | a;
    t = t + String.fromCharCode(n);
    if (u != 64) {
     t = t + String.fromCharCode(r)
    }
    if (a != 64) {
     t = t + String.fromCharCode(i)
    }
   }
   t = Base64._utf8_decode(t);
   return t
  },
  _utf8_encode: function(e) {
   e = e.replace(/rn/g, "n");
   var t = "";
   for (var n = 0; n < e.length; n++) {
    var r = e.charCodeAt(n);
    if (r < 128) {
     t += String.fromCharCode(r)
    } else if (r > 127 && r < 2048) {
     t += String.fromCharCode(r >> 6 | 192);
     t += String.fromCharCode(r & 63 | 128)
    } else {
     t += String.fromCharCode(r >> 12 | 224);
     t += String.fromCharCode(r >> 6 & 63 | 128);
     t += String.fromCharCode(r & 63 | 128)
    }
   }
   return t
  },
  _utf8_decode: function(e) {
   var t = "";
   var n = 0;
   var r = c1 = c2 = 0;
   while (n < e.length) {
    r = e.charCodeAt(n);
    if (r < 128) {
     t += String.fromCharCode(r);
     n++
    } else if (r > 191 && r < 224) {
     c2 = e.charCodeAt(n + 1);
     t += String.fromCharCode((r & 31) << 6 | c2 & 63);
     n += 2
    } else {
     c2 = e.charCodeAt(n + 1);
     c3 = e.charCodeAt(n + 2);
     t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
     n += 3
    }
   }
   return t
  }
}
var rootWindow = null
var projectWindows = {}
var projectIframes = {}
var urls = {}
var projectGroups = {}
function callUpdate() {
  for(var w in projectWindows) {
    rootWindow.onUpdateUrl && rootWindow.onUpdateUrl(urls)
    projectWindows[w].onUpdateUrl && projectWindows[w].onUpdateUrl(urls)
  }
}
//TODO:iframe的id必须是整个唯一的：mpod_项目名_任意（如：mpod_yunpan_content)
function setIframeSrc(projectId) {
  projectWindows[projectId].location.replace(window.location.protocol + '//'+window.location.host + '/' + urls[projectId])
  // projectIframes[projectId].src = window.location.protocol + '//'+window.location.host + '/' + urls[projectId]
}
function setGroupState(key, value, groupId) {
  if(projectGroups[groupId]) {
    for(var memmber in window.projectGroups[group]) {
      memmber.contentWindow.setProjectState && memmber.contentWindow.setProjectState(key, value)
    }
  }
}
/**
 * 修改iframe样式
 **/
function setIframeStyle(ifmId, config) {
  var ifm = projectIframes[ifmId]
  if(!ifm) {
    console.error('未找到要修改样式的iframe对象：', ifmId)
    return
  }
  for(var k in config) {
    ifm.style[k] = config[k]
  }
}
/**
 * 项目注册
 **/
function registerProject(ifm) {
  var projectId = ifm.id
  var projectWindow = ifm.contentWindow
  projectWindow.addEventListener('unload', function(e) {
    // console.log('delete ', projectId)
    // delete projectIframes[projectId];
    // delete projectWindows[projectId];
    // delete urls[projectId]
  })
  projectWindow.mpodId = projectId
  // console.log("group:", ifm.getAttribute("projectGroups"), 'register projectId:', projectId)
  if(ifm.getAttribute("projectGroups")) {
    var projectGroups = ifm.getAttribute("projectGroups").split(',')
    for(var i=0,ii=projectGroups.length;i<ii;i++) {
      var projectGroup = projectGroups[i].trim()
      if(projectGroup) {
        if(!window.projectGroups[projectGroup]) {
          window.projectGroups[projectGroup] = {
            ifms: [ifm]
          }
        } else {
          if(window.projectGroups[projectGroup].ifms.indexOf(ifm) === -1) { //添加iframe到组里面
            window.projectGroups[projectGroup].push(ifm)
          }
        }
      }
    }
  }
  projectIframes[projectId] = ifm
  projectWindows[projectId] = projectWindow
  projectWindow.onLoaded && projectWindow.onLoaded()
}
function getProjectWindow(projectId) {
  return projectWindows[projectId]
}
function changeUrlArg(url, arg, val){
  var pattern = arg+'=([^&]*)';
  var replaceText = arg+'='+val;
  return url.match(pattern) ? url.replace(eval('/('+ arg+'=)([^&]*)/gi'), replaceText) : (url.match('[\?]') ? url+'&'+replaceText : url+'?'+replaceText);
}
function updateUrl(projectId, url, notApply) {
  var param = Date.now()+Math.random()
  if(url.indexOf("?") !== -1) {
    if(url.indexOf("corerandom=") !== -1) {
      changeUrlArg(url, corerandom, param)
    } else {
      urls[projectId] = url + "&corerandom=" + param
    }
  } else {
    if(url.indexOf("corerandom=") !== -1) {
      changeUrlArg(url, corerandom, param)
    } else {
      urls[projectId] = url + "?corerandom=" + param
    }
  }
  // console.log(urls)
  location.hash = Base64.encode(JSON.stringify(urls))
  // if(!notApply) {
  //   setIframeSrc(projectId)
  // }
}
function _init(w) {
  rootWindow = w
  window.addEventListener('hashchange', function() {
    // projectWindows[projectId].location.replace(window.location.protocol + '//'+window.location.host + '/' + urls[projectId])
    urls = JSON.parse(Base64.decode(location.hash))
    console.log(urls)
    for(var k in urls) {
      if(projectWindows[k] && window.location.protocol + '//'+window.location.host + '/' + urls[k] !== projectWindows[k].location.href) {
        projectWindows[k].location.replace(window.location.protocol + '//'+window.location.host + '/' + urls[k])
      }
    }
    console.log('hashchange', location.hash, rootWindow)
    // rootWindow.onUpdateUrl && rootWindow.onUpdateUrl(urls)
    callUpdate()
  })
}