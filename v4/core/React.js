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
        shouldYield = deadline.timeRemaining() < 40;
    }
    // console.log("time:",deadline.timeRemaining());
    // 本轮渲染任务完成了
    if(!nextWorkOfUnit && root){
        commitRoot();
    }
    // 下一个空闲周期继续执行
    requestIdleCallback(workLoop);
}
// 把dom操作统一提交给root，而不是单独操作dom
function commitRoot(){
    commitWork(root.child); // 根节点
    root = null; // 表示本轮渲染结束
}
// 从根节点往下提交
function commitWork(fiber){
    if(!fiber){
        return;
    }
    fiber.parent.dom.append(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
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
/*
不是的.
1、jsx是一门框架无关的技术,和react不是强关联。https://github.com/facebook/jsx/tree/main
2、React.createElement 这个注释是 babel在编译阶段 添加的
3、为什么课程只使用了vite就可以使用jsx呢？
依赖链是这样的 vite-> babel-preset-react -> babel-plugin-transform-react-jsx

在这里把jsx转换为普通的javascript代码
https://github.com/babel/babel/blob/main/packages/babel-plugin-transform-react-jsx/src/create-plugin.ts


***/
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
