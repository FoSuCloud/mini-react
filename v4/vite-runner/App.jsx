import React from './core/React.js';
/*
为什么会打印 React.createElement？？ 因为vite做了处理，使用了我们导入的React
ƒ One() {
  return \/* @__PURE__ *\/ React.createElement("div", { id: "id" }, "hi mini-react");
}
**/
/*
react就是通过requestIdleCallback实现的可中断渲染，通过断点可以看到
先append div#app进去root, 再 append p,再append "hi"
在页面上就可以看到文案 "hi" 了
***/
function Counter({num}){
    return <div>count: {num}</div>
}

function App() {
    return <div id={"app"}>
        hi mini-react
        <Counter num={10}></Counter>
        <Counter num={20}></Counter>
    </div>
}

export default App;
