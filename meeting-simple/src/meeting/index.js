/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from "react";
import { Row, Col, message } from "antd";
import VideoWindow from "./video-window";
import CreateJoinView from "./create-join-view";
import * as api from "./api";

export default function Meeting() {
  const [data, setData] = useState({ status: "loading" });

  const updateMeeting = (status, pass, peer) => {
    setData({ status, pass, peer });
  };

  useEffect(() => {
    const meetingId = location.hash.slice(1);
    if (!meetingId) {
      return setData({ status: "initial" });
    }
    (async () => {
      try {
        const meeting = await api.getMeeting(meetingId);
        if (!meeting) {
          message.warn("Meeting not exists, you can create on instead");
          location.hash = "";
        }
        setData({ status: "initial", meeting });
      } catch (error) {
        console.warn(error);
        message.error("Failed to get meeting info: " + error.message);
      }
    })();
  }, []);

  return (
    <div className="meeting">
      <Row gutter={16}>
        <Col span={10} offset={2}>
          <VideoWindow />
        </Col>
        <Col span={10} offset={1}>
          {data.status === "loading" ? (
            <div>loading...</div>
          ) : data.status === "initial" ? (
            <CreateJoinView
              updateMeeting={updateMeeting}
              meeting={data.meeting}
            />
          ) : (
            data.peer && <VideoWindow peer={data.peer} />
          )}
        </Col>
      </Row>
      {data.status === "pending" ? (
        <Row gutter={16}>
          <Col span={8} offset={8}>
            <p>
              {" "}
              Copy and send meeting info to your partner <br />
              <b>
                Meeting url: {location.href}
                <br />
                {data.pass ? `Passcode: ${data.pass}` : null}
              </b>
            </p>
          </Col>
        </Row>
      ) : null}
    </div>
  );
}
