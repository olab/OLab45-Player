import styled from "styled-components";
import { DARK_TEXT } from "../../../shared/colors";

export const ReportWrapper = styled.div`
  margin-top: 15px;

  div.report-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: -12px;
    margin-left: -12px;

    p {
      margin: 0 0 5px;
      font-size: 14px;
      color: ${DARK_TEXT};
    }
  }
`;

export const ReportTopSection = styled.div`
  margin-top: 12px;
  margin-left: 12px;

  div.report-actions {
    margin-top: 10px;
    margin-left: -5px;

    > button {
      margin-left: 5px;
      margin-top: 3px;

      .MuiButton-startIcon {
        margin-right: 4px;
      }
    }
  }
`;
