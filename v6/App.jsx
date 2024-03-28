import React from './core/React.js';
let countFoo = 1;
function Foo(){
    console.log("Foo render");
    const update = React.update();
    function handleClick(){
        countFoo++;
        update();
    }
    return <div>
        foo {countFoo}
        <button onClick={handleClick}>click</button>
    </div>
}
let countBar = 1;
function Bar(){
    console.log("Bar render");
    const update = React.update();
    function handleClick(){
        countBar++;
        update();
    }
    return <div>
        bar {countBar}
        <button onClick={handleClick}>click</button>
    </div>
}
let countRoot = 1;
function App() {
    console.log("app render");
    const update = React.update();
    function handleClick(){
        countRoot++;
        update();
    }
    return (
        <div id={"app"}>
            mini-react count:{countRoot}
            <button onClick={handleClick}>click</button>
            <Foo></Foo>
            <Bar></Bar>
        </div>
    )
}


export default App;
