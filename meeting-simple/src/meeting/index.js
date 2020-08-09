/* eslint-disable no-restricted-globals */
import React, { useState } from 'react'
import { Row, Col} from 'antd'
import VideoWindow from './video-window'
import CreateJoinView from './create-join-view'

export default function Meeting() {
  const [data, setData] = useState({status: 'initial'})
  
  const updateMeeting = (status, pass) => {
    setData({status, pass})
  }

  return (
    <div className="meeting">
      <Row gutter={16}>
        <Col span={10} >
          <VideoWindow />
        </Col>
        <Col span={10} >
          {data.status === 'initial' ? <CreateJoinView updateMeeting={updateMeeting}/> : null}
        </Col>
      </Row>
      {
        data.status === 'pending' ? (<Row gutter={16}>
          <Col span={8} offset={8}>
            <p> Copy and send meeting info to your partner <br />
            <b>
            Meeting url: {location.href}<br />
            {data.pass ? `Passcode: ${data.pass}` : null}
            </b>
            </p>
          </Col>
        </Row>) : null
      }
    </div>
  )
}