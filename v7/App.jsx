import React from './core/React.js';

function Foo() {
    const [count, setCount] = React.useState(10);
    const [bar, setBar] = React.useState("bar");
    console.log("re render")
    function handleClick() {
        setCount((c) => c + 1);
        setCount(44);
        setBar((str) => str+"bar");
    }

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
