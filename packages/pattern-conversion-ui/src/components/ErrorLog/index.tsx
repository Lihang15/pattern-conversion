import React, { useState } from 'react';
import styles from './styles.less';

const ErrorLog = ({ logs, onClose }) => {
  return (
    <div className={styles.logContainer}>
            <div className={styles.logContent}>
                <p>Error Log Detail</p>
            <p>{logs}</p>
            </div> 
    /</div>
  );
};

export default ErrorLog;
