import React, {ChangeEvent, useEffect} from 'react';
import './App.css';
import {generateTasks, TestTask} from "./web-worker-service/generateTasks";

function App() {
  const [state, setState] = React.useState<number>(0);
  const [taskAmount, setTaskAmount] = React.useState<number>(10);
  const [taskExecutionTime, setTaskExecutionTime] = React.useState<number>(0);
  const [taskList, setTaskList] = React.useState<{type: number,task: TestTask}[]>([]);
  const [useWorker, setUseWorker] = React.useState<boolean>(false);
  const stateMessages: {[key:number]: JSX.Element} = {
      1: <div>Generating tasks...</div>,
      2: <div>Running tasks...</div>,
      3: <div>Done! Task Amount: {taskAmount}, Execution time: {taskExecutionTime}</div>
  }

  useEffect(() => {
      console.log('generating...')
      generateTasks(taskAmount).then((tasks) => {
          setTaskList(tasks);
      });
  }, [taskAmount]);

  const performTestsWithoutWorker = async () => {
      const start = Date.now();
      let resSum = 0;
      setState(1);
      //setTaskList(await generateTasks(taskAmount));
      const tasks = taskList;
      setState(2);
      for(const taskIndex in tasks) {
          const res = await tasks[taskIndex].task();
          console.log("Executed: ", taskIndex);
          resSum += res;
      }
      setState(3);
      const end = Date.now();
      setTaskExecutionTime(end - start);
      console.log(resSum);
  }

    const performTestsWithWorker = async () => {
        async function createWorkerTask(taskId: number, index: number) {
            return new Promise<number>((resolve, reject) => {
                const worker = new Worker('./worker.js');
                worker.postMessage({taskId, index});
                worker.onmessage = (event: any) => {
                    console.log("Executed: ", event.data.index);
                    resolve(event.data.result);
                };
                worker.onerror = (error: any) => {
                    reject(error);
                };
            });
        }

        const start = Date.now();
        setState(1);
        const tasks = taskList.map((task, index) => createWorkerTask(task.type, index));
        const resultArray = await Promise.all(tasks);
        setState(2);
        const end = Date.now();
        setTaskExecutionTime(end - start);
        setState(3);
        console.log(resultArray.reduce((acc, val) => acc + val, 0));
    }
  const performTests = async () => {

        if(useWorker) {
            performTestsWithWorker()
        } else {
            performTestsWithoutWorker();
        }
  }
  return (
    <div className="App">
      <header className="App-header">
          <div style={{display: 'flex', flexDirection:'column', width: '300px', gap: 16}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>Task amount: </div>
              <input type="number"
               value={taskAmount}
               onChange={(ev:ChangeEvent<HTMLInputElement>) => {
                   const val = Number((ev.target as any).value);
                   setTaskAmount(val);
               }} />
        </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>Use worker: </div>
                    <input type="checkbox"
                            checked={useWorker}
                            onChange={(ev:ChangeEvent<HTMLInputElement>) => {
                                const val = (ev.target as any).checked;
                                setUseWorker(val);
                            }
                            } />
                </div>
        <button onClick={() => performTests()}>Call test</button>
          <div>
          {
              stateMessages[state]
          }
          </div>
          </div>
      </header>
    </div>
  );
}

export default App;
