
import './style.less';  
  
import React, { useState, useEffect, useRef } from 'react';  
  
const TerminalOutput = () => {  
  // 预定义的日志数据（用于循环追加）  
  const logEntries = [  
    'Starting server...',  
    'Server is running on http://localhost:3000',  
    'API request received: /api/data',  
    'Fetching data from database...',  
    'Data fetched successfully',  
    'Performing background task...',  
    'Task completed successfully',  
    // 添加更多日志行以确保可以循环  
  ];  
  
  // 使用 useState 钩子来管理日志状态  
  const [logs, setLogs] = useState([]);  
  const logIndexRef = useRef(0); // 用于跟踪当前要追加的日志索引  
  
  // 定时追加日志的函数  
  const appendLog = () => {  
    // 获取当前要追加的日志条目  
    const newLog = logEntries[logIndexRef.current];  
  
    // 更新日志数组和索引引用  
    setLogs((prevLogs) => [...prevLogs, newLog]);  
    logIndexRef.current = (logIndexRef.current + 1) % logEntries.length; // 循环索引  
  
    // 自动滚动到底部（在setLogs的回调中执行以确保新日志已渲染）  
    scrollToBottom();  
  };  
  
  // 滚动到底部的函数  
  const scrollToBottom = () => {  
    const terminal = document.getElementById('terminal');  
    if (terminal) {  
      terminal.scrollTop = terminal.scrollHeight;  
    }  
  };  
  
  // 使用 useEffect 钩子来设置定时器  
  useEffect(() => {  
    const intervalId = setInterval(appendLog, 1000); // 每3秒追加一次日志  
  
    // 清除定时器的函数，用于组件卸载时清理  
    const cleanup = () => clearInterval(intervalId);  
  
    // 在组件卸载时执行清理函数  
    return cleanup;  
  }, []);  
  
  // 组件的 JSX 结构  
  return (  
    <div className="terminal-output-container">  
      <div id="terminal" className="terminal">  
        {logs.map((log, index) => (  
          <div key={index} className="log-line">  
            {log}  
          </div>  
        ))}  
      </div>  
    </div>  
  );  
};  
  
export default TerminalOutput;