import React from './core/React.js';

function Foo() {
    const [count, setCount] = React.useState(10);
    const [bar, setBar] = React.useState("bar");
    console.log("re render")
    function handleClick() {
        setCount((c) => c + 1);
        // setBar((str) => str+"bar");
    }

    // init调用一次，如果传递的是[]
    React.useEffect(() =>{
        console.log("init");
        return ()=>{
            console.log("clean up 0 ");
        }
    },[]);
    // 如果[]不是空的，那么会在每次数组里面的值更新的时候调用
    React.useEffect(() =>{
        console.log("update");
        return ()=>{
            console.log("clean up 1");
        }
    },[count]);
    React.useEffect(() =>{
        console.log("update");
        return ()=>{
            console.log("clean up 2");
        }
    },[count]);
    // useEffect 的调用时机是在react完成对DOM的渲染之后，并且在浏览器完成绘制之前
    return <div>
        foo {count}
        <div>bar: {bar}</div>
        <button onClick={handleClick}>click</button>
    </div>
}

function App() {
    return (
        <div id={"app"}>
            mini-react
            <Foo></Foo>
        </div>
    )
}


export default App;
