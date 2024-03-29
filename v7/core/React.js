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
    wipRoot = {
        dom: container,
        props: {
            children: [el]
        }
    };
    // 记录下本次渲染的根节点
    nextWorkOfUnit = wipRoot;
}

// work in progress 正在工作中的root
let wipRoot = null; // 用于判断当前渲染是否完成
let currentRoot = null; // 当前root节点，用于update
let nextWorkOfUnit = null; // 下一个要执行的任务
let deletions = []; // 保存要删除的节点
let wipFiber = null; // 表示正在更新的fiber组件

function workLoop(deadline) {
    let shouldYield = false;
    while (!shouldYield && nextWorkOfUnit) {
        // console.log("fiber:",lodash.cloneDeep(nextWorkOfUnit));
        // run task
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit); // 默认继续执行下一个任务，返回下一个任务
        // 如果下一个节点是当前root的兄弟节点，那么结束，因为我们不需要更新兄弟节点, type其实是function component
        if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
            console.log("hit", wipRoot, nextWorkOfUnit);
            nextWorkOfUnit = null;
        }
        // 空闲时间<1 表示当前任务所在空闲时间不足，下一个空闲周期继续run task
        shouldYield = deadline.timeRemaining() < 1;
    }
    // console.log("time:",deadline.timeRemaining());
    // 本轮渲染任务完成了
    if (!nextWorkOfUnit && wipRoot) {
        commitRoot();
    }
    // 下一个空闲周期继续执行
    requestIdleCallback(workLoop);
}

// 把dom操作统一提交给root，而不是单独操作dom
function commitRoot() {
    deletions.forEach(commitDeletion)
    commitWork(wipRoot.child); // 根节点
    console.log("root:", wipRoot);
    currentRoot = wipRoot;
    wipRoot = null; // 表示本轮渲染结束
    deletions = []; // 已经删除完毕，恢复
}

function commitDeletion(fiber) {
    if (fiber.dom) {
        let fiberParent = fiber.parent;
        while (!fiberParent.dom) {
            fiberParent = fiberParent.parent;
        }
        fiberParent.dom.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child);
    }
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
    if (fiber.effectTag === "update") {
        updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
    } else if (fiber.effectTag === "placement") {
        // function component
        if (fiber.dom) {
            fiberParent.dom.append(fiber.dom);
        }
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function createDom(type) {
    return type === 'TEXT_ELEMENT' ?
        document.createTextNode("") :
        document.createElement(type)
}

function updateProps(dom, nextProps, prevProps) {
    /*
    * {id:""}, {}
    * 1. old有，new没有， 删除
    * 2. new有，old没有，添加
    * 3. new有，old有，更新
    * **/
    // 1. old有，new没有， 删除
    Object.keys(prevProps).forEach((key) => {
        if (key !== 'children') {
            if (!(key in nextProps)) {
                dom.removeAttribute(key);
            }
        }
    });
    // 2. new有，old没有，添加
    // 3. new有，old有，更新
    Object.keys(nextProps).forEach((key) => {
        if (key !== 'children') {
            // old没有 或者 不等于
            if (nextProps[key] !== prevProps[key]) {
                // 添加/更新 逻辑 都一直，在这里都是用 = 完成
                if (key.startsWith("on")) {
                    // onClick -> click
                    const eventType = key.slice(2).toLowerCase();
                    // 此时的props[key] 是一个 function
                    if (prevProps[key]) {
                        dom.removeEventListener(eventType, prevProps[key]);
                    }
                    dom.addEventListener(eventType, nextProps[key]);
                } else {
                    dom[key] = nextProps[key];
                }
            }
        }
    });
}

// reconcile调和
function reconcileChildren(fiber, children) {
    let oldFiber = fiber.alternate?.child;
    let prevChild = null; // 上一个child
    children.forEach((child, index) => {
        // 其实就是判断元素tagName是否变化了
        const isSameType = oldFiber && oldFiber.type === child.type;
        let newFiber = null;
        if (isSameType) {
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: oldFiber.dom, // dom不变, 后续更新
                effectTag: "update", // 表示需要更新
                alternate: oldFiber
            };
        } else {
            if (child) {
                newFiber = {
                    type: child.type,
                    props: child.props,
                    child: null,
                    parent: fiber,
                    sibling: null,
                    dom: null,
                    effectTag: "placement" // 表示直接替换
                };
            }
            if (oldFiber) {
                // console.log("should delete", oldFiber);
                deletions.push(oldFiber);
            }
        }
        // 因为第一个child处理完了，我们需要更改 oldFiber， 使得我们可以指向 child.sibling 的备用 oldFiber.sibling
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }
        // 第一个child，作为链表第二个节点
        if (index === 0) {
            fiber.child = newFiber;
        } else {
            prevChild.sibling = newFiber; // b的兄弟节点sibling -> 指向c
        }
        // "a" false "b" -> 我们需要跳过false，这不是一个fiber,所以b还是需要依靠a指向
        if (newFiber) {
            prevChild = newFiber;
        }
    });
    // 旧的多，新的少，删除对应多出来的节点
    while (oldFiber) {
        deletions.push(oldFiber);
        oldFiber = oldFiber.sibling;
    }
}

// 函数式组件写法
function updateFunctionComponent(fiber) {
    stateHooks = []; // 初始化hooks
    stateIndex = 0;
    // 在初始化的时候，也会走performWorkOfUnit -> updateFunctionComponent -> 设置 wipFiber
    // 并且由于函数初始化fiber.type调用就是调用函数，所以也会走update()函数，取得 wipFiber 闭包
    wipFiber = fiber; // 函数组件更新，设置当前更新fiber
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children);
}

// const App =<div> 这种写法
function updateHostComponent(fiber) {
    if (!fiber.dom) {
        // 1. 创建DOM
        const dom = (fiber.dom = createDom(fiber.type));
        // 把当前dom添加到父亲节点上,但是不单独每个work都执行，在渲染完成后统一提交 更新dom
        // fiber.parent.dom.append(dom);
        // 2. 处理props
        updateProps(dom, fiber.props, {});
    }
    const children = fiber.props.children;
    reconcileChildren(fiber, children);
}

function performWorkOfUnit(fiber) {
    const isFunctionComponent = typeof fiber.type === 'function';
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
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

// update更新，把currentRoot(已经是旧树了)作为备用树alternate
function update() {
    let currentFiber = wipFiber;
    return () => {
        // console.log('currentRoot:', currentRoot);
        // 渲染el
        wipRoot = {
            ...currentFiber,
            alternate: currentFiber // 设置 alternate 备用树
        };
        // 记录下本次渲染的根节点
        nextWorkOfUnit = wipRoot;
    }
}

let stateHooks;
let stateIndex;

// 每次调用function component 都会重新初始化render,stateHooks,stateIndex
function useState(initial) {
    let currentFiber = wipFiber;
    const oldHook = currentFiber.alternate?.stateHooks[stateIndex]; // 上次渲染的state快照
    const stateHook = {
        state: oldHook ? oldHook.state : initial, // 不是初始化则取上次渲染的快照，否则取初始化值
        queue: oldHook ? oldHook.queue : []
    };
    // fiber.type()的时候会调用到这里
    // console.log("queue:",stateHook.queue)
    stateHook.queue.forEach((action) => {
        stateHook.state = action(stateHook.state);
    })
    stateHook.queue = [];

    stateHooks.push(stateHook);
    stateIndex++;
    currentFiber.stateHooks = stateHooks;

    function setState(action) {
        // 之前没有别的setState
        if(!stateHook.queue.length){
            // memo才会开启，相同值则不更新
            const eagerState = typeof action === "function" ? action(stateHook.state) : action;
            if (eagerState === stateHook.state) return;
        }

        if (typeof action === "function") {
            stateHook.queue.push(action);
        } else {
            stateHook.queue.push(() => action);
        }
        // 渲染el
        wipRoot = {
            ...currentFiber,
            alternate: currentFiber // 设置 alternate 备用树
        };
        console.log("setState wipRoot:", wipRoot);
        // 记录下本次渲染的根节点
        nextWorkOfUnit = wipRoot;
    }

    return [stateHook.state, setState]
}

const React = {
    useState,
    render,
    update,
    createElement
}
export default React;
