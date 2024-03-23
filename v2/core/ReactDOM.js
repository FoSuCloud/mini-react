import React from "./React.js";

const ReactDOM = {
    creatRoot(container){
        return {
            render(App){
                React.render(App,container)
            }
        }
    }
}
export default ReactDOM;
