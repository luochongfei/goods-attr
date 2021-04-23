// NodeList forEach
if (typeof NodeList.prototype.forEach !== 'function')  {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

// Element.matches
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

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

class GoodsAttr {
    constructor(el, options = {}) {
        if (!el) {
            return;
        }

        this.el = el;
        this.opt = objectCopy({
            matchList: [],
            matchAttr: 'primeId',
            rowCls: 'row',
            itemCls: 'item',
            itemActiveCls: 'active',
            itemPrimeAttr: 'data-p',
            success: null,
            fail: null,
        }, options);

        // 匹配列表为空判断
        if (!this.opt.matchList.length) {
            return;
        }

        // 所有行 元素
        this.rows = this.el.querySelectorAll('.' + this.opt.rowCls);
        if (!this.rows) {
            return;
        }

        // 格式化匹配列表
        this.formatPrimeList();

        // 创建dom模型
        this.createModel();

        // 初始化
        this.init();
    }

    init() {
        // 初始化各项可用状态
        this.initState();

        // 绑定事件
        this.bindEvent();
    }

    // 绑定事件
    bindEvent() {
        // 子项点击处理
        function itemClickHandle(item) {
            const rowIndex = item.rowIndex;
            const row = this.model[rowIndex];

            // 高亮当前项
            for (let i = 0; i < row.length; i++) {
                removeClass(row[i], 'active');
            }
            removeClass(item, 'disabled');
            addClass(item, 'active');

            // 变更当前行高亮项
            row.active = item;
            row.activePrime = item.prime;
        }

        // 绑定点击事件
        this.el.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.matches('.' + this.opt.itemCls)) {
                const target = e.target;
                if (hasClass(target, 'active')) {
                    return;
                }

                itemClickHandle.call(this, target);

                this.otherRowHandle(+target.prime, target.rowIndex, true);
            }
        }, false);
    }

    // 格式化匹配列表
    formatPrimeList() {
        const primeObj = {};
        const primeList = [];

        this.opt.matchList.forEach((item) => {
            const prime = item[this.opt.matchAttr];
            primeObj[prime] = item;
            primeList.push(+prime);
        });

        this.primeObj = primeObj;
        this.primeList = primeList;
    }

    // 给行创建数据模型，包含 {子项节点，行号，选中项，选中项的质数}
    rowModel(rowIndex) {
        const rowObj = {};
        const row = this.rows[rowIndex];
        const active = row.querySelector('.' + this.opt.itemActiveCls);
        const items = row.querySelectorAll('.' + this.opt.itemCls);

        items.forEach((item, index) => {
            item.rowIndex = rowIndex;
            item.prime = +item.getAttribute(this.opt.itemPrimeAttr);

            rowObj[index] = item;
            if (item === active) {
                rowObj['active'] = item;
                rowObj['activePrime'] = item.prime;
            }
        });
        rowObj.length = items.length;

        this.model[rowIndex] = rowObj;
    }

    // 创建整体数据模型
    createModel() {
        this.model = [];
        this.rows.forEach((row, rowIndex) => {
            this.rowModel(rowIndex);
        });
    }

    // 变更各项状态
    initState() {
        this.model.forEach((row, rowIndex) => {
            const basePrime = +row.activePrime;
            this.otherRowHandle(basePrime, rowIndex);
        });
    }

    // 其他行处理
    otherRowHandle(basePrime, baseIndex, isClick) {
        const newPrimeList = this.primeList.filter(item => {
            if (item % basePrime === 0) {
                return item / basePrime;
            }
        });

        this.model.forEach((row, rowIndex) => {
            if (rowIndex !== baseIndex) {
                for(let i = 0; i < row.length; i++) {
                    const item = row[i];
                    const itemP = item.prime;


                    let itemCan = false;
                    for (let p = 0; p < newPrimeList.length; p++) {
                        const pItem = newPrimeList[p];
                        if (pItem % itemP === 0) {
                            itemCan = true;
                        }
                    }

                    if (isClick && !itemCan) {
                        removeClass(item, 'active');
                    }

                    if (!itemCan) {
                        addClass(item, 'disabled');
                    } else {
                        removeClass(item, 'disabled');
                    }
                }
            }
        });

        this.callback();
    }

    // 回调处理
    callback() {
        let prime = 1;
        this.model.forEach((item, index) => {
            prime *= +item.activePrime;
        });

        // 未匹配处理
        if (!(prime in this.primeObj)) {
            if (typeof this.opt.fail === 'function'){
                this.opt.fail.call(this);
            }
            return;
        }

        // 如果有回调处理函数
        if (typeof this.opt.success === 'function') {
            this.opt.success.call(this, this.primeObj[prime]);
        }
    }
}

export default GoodsAttr;
