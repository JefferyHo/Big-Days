import { useEffect, useState } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import { useDB } from "../../db/DBProvider";
import { useNavigate } from "react-router-dom";
import { Button, Tag } from "antd-mobile";

interface DateProps {
  id: string;
  title: string;
  date: string;
  level: number;
}

interface DateOnlineProps {
  holiday: boolean;
  name: string;
  wage: number;
  date: string;
  rest: number;
}

function App() {
  const db = useDB();
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [dataList, setDataList] = useState<DateProps[]>([]);
  const [dataListOnline, setDataListOnline] = useState<DateProps[]>([]);

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
    const months = dayjs().format("YYYY");

    fetch("https://timor.tech/api/holiday/year/" + months + '/')
      .then((res) => res.json())
      .then((data) => {
        const {
          code,
          holiday,
        }: {
          code: number;
          holiday: Record<string, DateOnlineProps>;
        } = data;

        if (code !== 0) {
          console.error("获取在线假日数据失败");
          return;
        }

        // map: { key: [holidayName], value: [holidayStartDay] }
        const holidayMap = new Map();
        for (const dateObj of Object.values(holiday)) {
          const { name, holiday, date } = dateObj;
          if (!holiday) continue;
          if (holidayMap.has(name)) {
            continue;
          }
          holidayMap.set(name, date);
        }

        const dateArray: DateProps[] = [];
        for (const [name, startdate] of holidayMap.entries()) {
          if (dayjs(startdate).isAfter(dayjs())) {
            dateArray.push({
              id: '' + Date.now(),
              title: name,
              date: startdate,
              level: 1,
            });
          }
        }

        setDataListOnline(dateArray);
      });
  }, []);

  useEffect(() => {
    if (db) {
      async function getList() {
        const list = (await db.readAll()) as DateProps[];
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
  }, [db]);

  return (
    <Wrap>
      <Time>{dayjs(time).format("YYYY-MM-DD HH:mm:ss")}</Time>
      <DayNodeOutWrap>
        <DayNodeWrap>
          {dataList.map((dd) => (
            <DayNode key={dd.title} onClick={() => navigate("/info/" + dd.id)}>
              <DayNodeTitle>
                距离「{dd.title}」{dayjs(dd.date) > dayjs() ? "还有" : "已过去"}
              </DayNodeTitle>
              <DelayNodeDay>
                {Math.abs(dayjs(dd.date).diff(dayjs(), "day"))}{" "}
                <DelayNodeDayUnit>天</DelayNodeDayUnit>
              </DelayNodeDay>
            </DayNode>
          ))}
        </DayNodeWrap>

        <DayNodeWrap>
          {dataListOnline.map((dd) => (
            <DayNode key={dd.title}>
              <DayNodeTitle>
              <span>距离「{dd.title}」还有</span>
              <Tag color='primary' fill='outline'>
                系统
              </Tag>
              </DayNodeTitle>
              <DelayNodeDay>
                {Math.abs(dayjs(dd.date).diff(dayjs(), "day"))}{" "}
                <DelayNodeDayUnit>天</DelayNodeDayUnit>
              </DelayNodeDay>
            </DayNode>
          ))}
        </DayNodeWrap>
      </DayNodeOutWrap>
      <AddOne onClick={() => navigate("/info")}>
        <Button block shape="default" color="primary" size="small">
          + 创建
        </Button>
      </AddOne>
    </Wrap>
  );
}

const Wrap = styled.div`
  height: 100dvh;
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

const DayNodeOutWrap = styled.div`
flex: 1;
overflow-y: auto;
display: flex;
flex-direction: column;
`;

const DayNodeWrap = styled.div`
`;

const DayNode = styled.div`
  margin: 0 1rem 0.8rem;
  border-radius: 6px;
  background: #fff;
  padding: 0.4rem 1rem;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
`;

const DayNodeTitle = styled.div`
  padding: 0.4rem 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
`;

const DelayNodeDay = styled.p`
  font-size: 2rem;
  text-align: center;
  padding: 0.5rem 0;
`;

const DelayNodeDayUnit = styled.span`
  font-size: 1rem;
`;
export default App;
