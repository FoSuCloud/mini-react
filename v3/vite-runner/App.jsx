import React from './core/React.js';
// const App = React.createElement("div", {id:"app"},"hi ","mini-react");

// 转换为JSX写法
// const App = <div>hi mini-react</div>;
// console.log(App);  // 实际上和我们React.createElement得到的是同样的对象结构
/*
{
    "type": "div",
     "props": {
        "children": [
            {
                "type": "TEXT_ELEMENT",
                "props": {
                    "nodeValue": "hi mini-react",
                    "children": []
                }
            }
        ]
    }
}
**/


// function One(){
//     return <div id={"id"}>hi mini-react</div>
// }
// console.log(One);
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
* **/
const App = <div id={"app"}>
    <p>hi</p>
    <p>mini-react</p>
    <div id={"content"}>
        <div>hello</div>
        <p>world</p>
    </div>
</div>
export default App;
