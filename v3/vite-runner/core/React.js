import lodash from "lodash";

function createTextNode(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => {
                return typeof child === 'string' ? createTextNode(child) : child;
            })
        }
    }
}

function render(el, container) {
    // 渲染el
    nextWorkOfUnit = {
        dom: container,
        props: {
            children: [el]
        }
    };
}

let nextWorkOfUnit = null; // 下一个要执行的任务
function workLoop(deadline) {
    let shouldYield = false;
    while (!shouldYield && nextWorkOfUnit) {
        console.log("fiber:",lodash.cloneDeep(nextWorkOfUnit));
        // run task
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit); // 默认继续执行下一个任务，返回下一个任务
        // 空闲时间<1 表示当前任务所在空闲时间不足，下一个空闲周期继续run task
        // 但是电脑性能太好了，为了避免卡死，建议 先改为 <40
        shouldYield = deadline.timeRemaining() < 40;
    }
    console.log("time:",deadline.timeRemaining());
    // 下一个空闲周期继续执行
    requestIdleCallback(workLoop);
}

function createDom(type) {
    return type === 'TEXT_ELEMENT' ?
        document.createTextNode("") :
        document.createElement(type)
}

function updateProps(dom,props){
    Object.keys(props).forEach((key) => {
        if (key !== 'children') {
            dom[key] = props[key];
        }
    });
}
function initChildren(fiber){
    const children = fiber.props.children;
    let prevChild = null; // 上一个child
    children.forEach((child, index) => {
        const newFiber = {
            type: child.type,
            props: child.props,
            child: null,
            parent: fiber,
            sibling: null,
            dom: null
        };
        // 第一个child，作为链表第二个节点
        if (index === 0) {
            fiber.child = newFiber;
        } else {
            prevChild.sibling = newFiber; // b的兄弟节点sibling -> 指向c
        }
        prevChild = newFiber;
    });
}
function performWorkOfUnit(fiber) {
    if (!fiber.dom) {
        // 1. 创建DOM
        const dom = (fiber.dom = createDom(fiber.type));
        // 把当前dom添加到父亲节点上
        fiber.parent.dom.append(dom);
        // 2. 处理props
        updateProps(dom, fiber.props);
    }
    // 3. 转换链表，设置好指针
    // 例子： performWorkOfUnit(a), b->c 是child
    initChildren(fiber);
    // 如果是a -> (b,c,d,e); 那么 结果就是 b.sibling = c,然后继续c.sibling = d... 通过sibling我们可以找到所有兄弟节点
    // 4. 返回下一个要执行的任务
    if (fiber.child) {
        return fiber.child;
    }
    if (fiber.sibling) {
        return fiber.sibling;
    }
    return fiber.parent?.sibling;
}

// 只要程序在执行，那么就会循环 requestIdleCallback
requestIdleCallback(workLoop);

const React = {
    render,
    createElement
}
export default React;
