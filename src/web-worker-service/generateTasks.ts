export type TestTask = () => (void | Promise<void>);

function simpleTask(): void {
    console.log("ST");
}

async function timeoutTask(): Promise<void> {
    console.log('Starting TT');
    await setTimeout(() => {
        console.log('Done TT');
    }, 100);
}

function timeConsumingTask(): void {
        console.log("Starting TCT");

        // emulate time consuming task
        let n = 1000000000;
        while (n > 0){
            n--;
        }
        console.log("TCT Done");
}

async function asyncTask(): Promise<void> {
    console.log("Starting AT");
    await fetch("https://jsonplaceholder.typicode.com/todos/1");
    console.log("AT Done");
}

export const taskTypes: {[key: number]: {type: number, task: TestTask}} = {
    0: {type: 0,task: simpleTask},
    1: {type: 1,task: timeoutTask},
    2: {type: 2,task: timeConsumingTask},
    3: {type: 3,task: asyncTask}
}

export function generateTasks(amount: number): Promise<{type: number, task: TestTask}[]> {
    return new Promise<{type: number, task: TestTask}[]>((resolve) => {
    const tasks: {type: number, task: TestTask}[] = [];
    for (let i = 0; i < amount; i++) {
        const taskIndex = Math.floor(Math.random() * 4);
        tasks.push(taskTypes[taskIndex]);
    }
    resolve(tasks);
    });
}