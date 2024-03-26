import React from './core/React.js';

let count = 10;
let props = {id:"11111"}
function Counter({num}){

    function handleClick() {
        count++;
        props = {};
        // console.log("click");
        React.update();
    }

    return <div {...props}>
        count: {count}
        <button onClick={handleClick}>click</button>
    </div>
}

function App() {
    return <div id={"app"}>
        hi mini-react
        <Counter num={10}></Counter>
    </div>
}

export default App;
