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
为什么会打印React.createElement？？ 因为vite做了处理，使用了我们导入的React
ƒ One() {

  return \/* @__PURE__ *\/ React.createElement("div", { id: "id" }, "hi mini-react");
}
**/
const App = <div id={"app"}>hi mini-react</div>
export default App;
