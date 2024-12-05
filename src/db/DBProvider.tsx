import React, { createContext, useContext, useEffect, useState } from 'react';
import IndexDB from './indexDB';
import styled from 'styled-components';

const DBContext = createContext<IndexDB | null>(null);

export const DBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dBReady, setDBReady] = useState<null | IndexDB>(null);

  useEffect(() => {
    const initializeDB = async () => {
      const dbInstance = new IndexDB('big_days', 'days', [
        { name: 'title', unique: true }, 
        { name: 'date', unique: false }, 
        { name: 'createAt', unique: false }, 
        { name: 'updateAt', unique: false }, 
        { name: 'level', unique: false }, 
      ]);
      await dbInstance.init();
      setDBReady(dbInstance);
    };
    initializeDB();
  }, []);

  return (
    <DBContext.Provider value={dBReady}>
      {dBReady ? children : <DatabseLoading>加载中...</DatabseLoading> }
    </DBContext.Provider>
  );
};

const DatabseLoading = styled.div`
  text-align: center;
  margin-top: 20rem;
`;

export const useDB = () => {
  const context = useContext(DBContext);
  if (!context) {
    throw new Error('useDB must be used within a DBProvider');
  }
  return context;
};
