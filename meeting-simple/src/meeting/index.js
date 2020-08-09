import React from 'react'
import { Row, Col} from 'antd'
import VideoWindow from './video-window'

export default function Meeting() {
  return (
    <div className="meeting">
      <Row gutter={16}>
        <Col span={10} >
          <VideoWindow />
        </Col>
      </Row>
    </div>
  )
}