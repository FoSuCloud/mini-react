/*
function workLoop(deadline){
    console.log(deadline.timeRemaining());
    requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);
// deadline.timeRemaining() 当前任务所剩余的时间是什么概念呢？当前任务的预计时间是怎么得出的？
// 能不能用图或者更加具体的伪代码说明下？

timeRemaining空闲时间是怎么计算出来的？
1、首先在https://developer.mozilla.org/zh-CN/docs/Web/API/Background_Tasks_API
可以知道 目前，timeRemaining() 有一个 50 ms 的上限时间，因此空闲时间应该和帧时间16.7ms没有数学关系。
2、另外在上面的链接还得知"真正的 requestIdleCallback() 将自己限制在当前事件循环传递中的空闲时间内"
那么举个例子：宏任务1执行完毕后，宏任务2还未开始的间隙就是空闲期对吗？


**/
let taskId = 0;
function workLoop(deadline){
    taskId++;
    let shouldYield = false;
    while(!shouldYield){
        // run task
        console.log(`taskId:${taskId} run task`);
        // dom操作

        // 空闲时间<1 表示当前任务所在空闲时间不足，下一个空闲周期继续run task
        // 但是电脑性能太好了，为了避免卡死，建议 先改为 <40
        shouldYield = deadline.timeRemaining()<40;
    }
    // 下一个空闲周期继续执行
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
