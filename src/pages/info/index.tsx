import { RefObject, useEffect } from 'react'
import dayjs from 'dayjs'
import { Form, Input, Button, DatePickerRef, DatePicker, Space, Toast, Rate } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import { useDB } from '../../db/DBProvider';

function Info() {
  const db = useDB();
  const navigate = useNavigate();

  const { id } = useParams();
  const dateId = id || null;

  const [form] = Form.useForm()

  useEffect(() => {
    async function getRecord() {
     const record = await db.readOneById(id as string);
     console.log(record);
     form.setFieldsValue({
      ...record,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      date: new Date(record.date)
     });
    }
    if (id && db) {
      getRecord();
    }
  }, [id, db]);

  const onFinish = async () => {
    const values = form.getFieldsValue();
    try {
      if (id) {
        await db.update({
          id,
          ...values,
          date: dayjs(values.date).format('YYYY-MM-DD')
        });
      } else {
        await db.add({
          ...values,
          date: dayjs(values.date).format('YYYY-MM-DD')
        });
      }
      navigate('/')
    } catch(e) {
      console.log(e);
      Toast.show({
        content: e as string,
      })
    }
  };

  const handleRemove = async () => {
    await db.removeById(id as string);

    navigate('/');
  }

  return (
    <>
      <Form
        form={form}
        name='form'
        initialValues={{
          title: '',
          date: null,
          level: 1
        }}
        onFinish={onFinish}
        footer={
          <Space block direction='vertical' wrap>
            <Button block type='submit' color='primary'>
              提交
            </Button>

            {
              dateId ? <Button block color='danger' onClick={handleRemove}>
                删除
            </Button> : null }

            <Button block onClick={() => navigate('/')}>
              返回
            </Button>
          </Space>
        }
      >
        <Form.Header>信息录入</Form.Header>
        <Form.Item name='title' label='标题' rules={[{ required: true }]}>
          <Input placeholder='请输入标题' />
        </Form.Item>
        <Form.Item
          name='date'
          label='日期'
          trigger='onConfirm'
          rules={[{ required: true }]}
          onClick={(_, datePickerRef: RefObject<DatePickerRef>) => {
            datePickerRef.current?.open()
          }}
        >
          <DatePicker
            min={dayjs().subtract(50, 'year').startOf('year').toDate()}
            max={dayjs().add(50, 'year').endOf('year').toDate()}>
            {value =>
              value ? dayjs(value).format('YYYY-MM-DD') : '请选择日期'
            }
          </DatePicker>
        </Form.Item>
        <Form.Item name='level' label='重要性' rules={[{ required: true }]}>
          <Rate allowClear={false} />
        </Form.Item>
      </Form>
    </>
  )
}
export default Info;
