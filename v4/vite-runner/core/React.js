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

// jsx 会默认调用 createElement 来解析元素
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => {
                const isTextNode = typeof child === "string" || typeof child === "number";
                return isTextNode ? createTextNode(child) : child;
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
    // 记录下本次渲染的根节点
    root = nextWorkOfUnit;
}

let root = null;
let nextWorkOfUnit = null; // 下一个要执行的任务
function workLoop(deadline) {
    let shouldYield = false;
    while (!shouldYield && nextWorkOfUnit) {
        // console.log("fiber:",lodash.cloneDeep(nextWorkOfUnit));
        // run task
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit); // 默认继续执行下一个任务，返回下一个任务
        // 空闲时间<1 表示当前任务所在空闲时间不足，下一个空闲周期继续run task
        // 但是电脑性能太好了，为了避免卡死，建议 先改为 <40
        shouldYield = deadline.timeRemaining() < 1;
    }
    // console.log("time:",deadline.timeRemaining());
    // 本轮渲染任务完成了
    if (!nextWorkOfUnit && root) {
        commitRoot();
    }
    // 下一个空闲周期继续执行
    requestIdleCallback(workLoop);
}

// 把dom操作统一提交给root，而不是单独操作dom
function commitRoot() {
    commitWork(root.child); // 根节点
    // console.log("root:",root);
    root = null; // 表示本轮渲染结束
}

// 从根节点往下提交
function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    let fiberParent = fiber.parent;
    // console.log("commit:",fiber, fiber.parent);
    // function component
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent;
    }
    // function component
    if (fiber.dom) {
        fiberParent.dom.append(fiber.dom);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function createDom(type) {
    return type === 'TEXT_ELEMENT' ?
        document.createTextNode("") :
        document.createElement(type)
}

function updateProps(dom, props) {
    Object.keys(props).forEach((key) => {
        if (key !== 'children') {
            dom[key] = props[key];
        }
    });
}

function initChildren(fiber, children) {
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
// 函数式组件写法
function updateFunctionComponent(fiber) {
    const children = [fiber.type(fiber.props)]
    initChildren(fiber, children);
}
// const App =<div> 这种写法
function updateHostComponent(fiber) {
    if (!fiber.dom) {
        // 1. 创建DOM
        const dom = (fiber.dom = createDom(fiber.type));
        // 把当前dom添加到父亲节点上,但是不单独每个work都执行，在渲染完成后统一提交 更新dom
        // fiber.parent.dom.append(dom);
        // 2. 处理props
        updateProps(dom, fiber.props);
    }
    const children = fiber.props.children;
    initChildren(fiber, children);
}

function performWorkOfUnit(fiber) {
    const isFunctionComponent = typeof fiber.type === 'function';
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }
    // 3. 转换链表，设置好指针 这一步在update一起做了
    // 例子： performWorkOfUnit(a), b->c 是child
    // 如果是a -> (b,c,d,e); 那么 结果就是 b.sibling = c,然后继续c.sibling = d... 通过sibling我们可以找到所有兄弟节点
    // 4. 返回下一个要执行的任务
    if (fiber.child) {
        return fiber.child;
    }
    if (fiber.sibling) {
        return fiber.sibling;
    }
    // 遍历往上找parent.parent....的sibling
    let nextFiber = fiber.parent;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

// 只要程序在执行，那么就会循环 requestIdleCallback
requestIdleCallback(workLoop);

const React = {
    render,
    createElement
}
export default React;
