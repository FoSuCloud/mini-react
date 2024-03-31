## setState实现
1、闭包 保留上次渲染state, 不存在则使用initail初始化值
2、数组存储setState,避免多个state
3、批量处理state,只渲染一次
4、setState的参数是函数，那么把state当前值传递过去作为参数；如果不是函数，那么包装一下为() => action，也就是直接赋值

