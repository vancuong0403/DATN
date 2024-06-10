import styled from "@emotion/styled";
import React from "react";
import { Typography } from "./StyledTypography.js";
import { Skeleton, Row, Col, notification, Form, Input, Card } from "antd";

const StyledSidebarHeader = styled.div`
  height: 100px;
  min-height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;

  > div {
    width: 100%;
    overflow: hidden;
  }
`;

const StyledLogo = styled.div`
  width: 35px;
  min-width: 35px;
  height: 35px;
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: white;
  font-size: 24px;
  font-weight: 700;
  background-color: #009fdb;
  background: linear-gradient(45deg, rgb(21 87 205) 0%, rgb(90 225 255) 100%);
  ${({ rtl }) =>
    rtl
      ? `
      margin-left: 10px;
      margin-right: 4px;
      `
      : `
      margin-right: 10px;
      margin-left: 4px;
      `}
`;

const SidebarHeader = ({ fullName, avatarPath, permission, ...rest }) => {
  const GetName = (fullName) => {
    if (fullName) {
      let words = fullName.split(" ");

      let abbreviatedName = words[0];

      for (let i = 1; i < words.length - 1; i++) {
        abbreviatedName += " " + words[i].charAt(0).toUpperCase() + ".";
      }

      if (words.length > 1) {
        abbreviatedName += " " + words[words.length - 1];
      }
      return abbreviatedName;
    }
    return "";

  };

  const abbreviateRoleName = (roleName) => {
    if (roleName) {
      const words = roleName.split(" ");
      if (words.length > 2) {
        return words[0][0] + "." + words[1][0] + " " + words.slice(-2).join(" ");
      } else {
        return roleName;
      }
    } else {
      return "";
    }

  };

  return (
    <Card className="sideheader shadown" style={{ cursor: "pointer" }}>
      {permission ? (
        <Row>
          <Col>
            <div
              className={"userdropdown sideheader-avatar"}
              style={{
                marginRight: 5,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #000",
              }}
            >
              <img src={avatarPath} height={60} width={60} />
            </div>
          </Col>

          <Col
            style={{
              flex: "1",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              paddingTop: 5,
            }}
          >
            <Typography variant="subtitle2" fontWeight={500} color="#0098e5">
              {GetName(fullName)}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={500}
              style={{ opacity: 0.7, letterSpacing: "0.5px" }}
            >
              {abbreviateRoleName(permission.roleName)}
            </Typography>
          </Col>
        </Row>
      ) : (
        <Skeleton />
      )}
    </Card>
  );
};

export { SidebarHeader };
