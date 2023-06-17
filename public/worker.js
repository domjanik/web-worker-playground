function simpleTask() {
    console.log("ST");
}

async function timeoutTask() {
    console.log('Starting TT');
    await setTimeout(() => {
        console.log('Done TT');
    }, 100);
}

function timeConsumingTask() {
    console.log("Starting TCT");

    // emulate time consuming task
    let n = 1000000000;
    while (n > 0){
        n--;
    }
    console.log("TCT Done");
}

async function asyncTask() {
    console.log("Starting AT");
    await fetch("https://jsonplaceholder.typicode.com/todos/1");
    console.log("AT Done");
}

const taskTypes = {
    0: {type: 0, task: simpleTask},
    1: {type: 1, task: timeoutTask},
    2: {type: 2, task: timeConsumingTask},
    3: {type: 3, task: asyncTask}
}

self.onmessage = (event) => {
    const { taskId, index } = event.data;
    const {task} = taskTypes[taskId];
    const taskRes = task();
    if(taskRes?.then) {
        taskRes.then(() => {
            self.postMessage({index});
        }).catch((error) => {
            console.error('Error executing task:', error);
            self.postMessage({index, error: true});
        });
    } else {
        self.postMessage({index});
    }
};
