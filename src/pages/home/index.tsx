import { useEffect, useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { useDB } from '../../db/DBProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd-mobile';

interface DateProps {
  id: string;
  title: string;
  date: string;
  level: number;
}

function App() {
  const db = useDB();
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [dataList, setDataList] = useState<DateProps[]>([]);

  useEffect(() => {

    let animationFrameId: number;

    const update = () => {
      setTime(new Date());
      animationFrameId = requestAnimationFrame(update);
    };

    // 开始动画帧循环
    animationFrameId = requestAnimationFrame(update);

    // setDataList([
    //   {
    //     title: '元旦',
    //     date: '2025-01-01'
    //   },
    //   {
    //     title: '新年',
    //     date: '2025-1-31'
    //   },
    //   {
    //     title: '相识',
    //     date: '2024-3-20'
    //   },
    // ]);

    // 清理动画帧
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    
    if (db) {
      async function getList() {
        const list = await db.readAll() as DateProps[];
        // console.log(list);
        const now = dayjs(); // 当前时间
        list.sort((a, b) => {
          if (a.level !== b.level) return b.level - a.level;

          const atime = dayjs(a.date);
          const btime = dayjs(b.date);

          const isABeforeNow = atime.isBefore(now);
          const isBBeforeNow = btime.isBefore(now);

          if (isABeforeNow === isBBeforeNow) {
            const aDiff = Math.abs(atime.diff(now));
            const bDiff = Math.abs(btime.diff(now));
            return aDiff - bDiff; 
          }

          if (isABeforeNow) return 1;
          return -1;
        });
        setDataList(list);
      }
      getList();
    }

  }, [db])

  return (
    <Wrap>
      <Time>{ dayjs(time).format('YYYY-MM-DD HH:mm:ss')}</Time>
      {
        dataList.length === 0 && <AddOneTip>开始创建一个日程吧～</AddOneTip>
      }
      <DayNodeWrap>
        {
          dataList.map((dd) => (
            <DayNode key={dd.title} onClick={() => navigate('/info/' + dd.id)}>
              <DayNodeTitle>
                距离「{dd.title}」{dayjs(dd.date) > dayjs() ? '还有' : '已过去'}
              </DayNodeTitle>
              <DelayNodeDay>
                {Math.abs(dayjs(dd.date).diff(dayjs(), 'day'))} <DelayNodeDayUnit>天</DelayNodeDayUnit>
              </DelayNodeDay>
            </DayNode>
          ))
        }
      </DayNodeWrap>
      <AddOne onClick={() => navigate('/info')}>
        <Button block shape='default' color='primary' size="small">
            + 创建
          </Button>
        </AddOne>
    </Wrap>
  )
}

const Wrap = styled.div`
  height: 100vh;
  background: #f1f2f3;
  padding: 1rem 0rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const Time = styled.p`
  text-align: center;
  margin-bottom: 1rem;
`;

const AddOne = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 1rem;
  line-height: 1;
  font-size: 1rem;
`;

const DayNodeWrap = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const DayNode = styled.div`
  margin: 0 1rem .8rem;
  border-radius: 6px;
  background: #fff;
  padding: .4rem 1rem;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
`

const DayNodeTitle = styled.div`
  padding: 0.4rem 0;
  border-bottom: 1px solid #eee;
`;

const DelayNodeDay = styled.p`
  font-size: 2rem;
  text-align: center;
  padding: 0.5rem 0;
`;

const DelayNodeDayUnit = styled.span`
  font-size: 1rem;
`;

const AddOneTip = styled.div`
  text-align: center;
  padding: .5rem 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #ddd;
  margin: .8rem 1rem;
  color: #fff;
  font-size: .8rem;
`;

export default App
