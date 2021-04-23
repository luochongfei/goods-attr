// Object.assign
function objectCopy(obj1 = {}, obj2 = {}) {
    for (let o in obj2) {
        obj1[o] = obj2[o];
    }
    return obj1;
}

function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

function addClass(el, cls) {
    if (!cls || !trim(cls)) {
        return;
    }

    var clsArr = trim(cls).split(/\s+/);
    var oldCls = trim(el.className);

    if (!oldCls) {
        el.className = clsArr.join(' ');
    } else {
        el.className = oldCls.split(/\s+/).concat(clsArr).join(' ');
    }
}

function removeClass(el, cls) {
    if (!trim(el.className) || !cls || !trim(cls) || !hasClass(el, cls)) {
        return;
    }

    var cls = trim(cls);
    var oldClsArr = trim(el.className).split(/\s+/);
    var idx = 0;
    var newArr = [];

    while (idx < oldClsArr.length) {
        if (!(oldClsArr[idx] === cls)) {
            newArr.push(oldClsArr[idx]);
        }
        ++idx;
    }

    el.className = newArr.join(' ');
}

function hasClass(el, cls) {
    if (!cls || !trim(cls)) {
        return;
    }

    var oldClsArr = trim(el.className).split(/\s+/);
    return oldClsArr.indexOf(trim(cls)) >= 0;
}


export {
    objectCopy,
    addClass,
    removeClass,
    hasClass
};