import styled from "styled-components";

import { GREY, DARK_GREY } from "../../../../../../shared/colors";

export const SearchWrapper = styled.div`
  position: relative;
`;

export const MapListWrapper = styled.div`
  max-height: 50vh;
  overflow: auto;
`;

export const ListItemContent = styled.div`
  width: 100%;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  small {
    display: none;
    font-style: italic;
    font-size: small;
    color: ${DARK_GREY};
    user-select: none;
  }

  &:hover > small {
    display: block;
  }

  &:hover {
    background-color: ${GREY};
  }
`;

const styles = () => ({
  list: {
    marginBottom: 10,
    "&::-webkit-scrollbar": {
      width: 7,
      backgroundColor: GREY,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: DARK_GREY,
      borderRadius: 4,
    },
    "&::-webkit-scrollbar-button": {
      width: 0,
      height: 0,
      display: "none",
    },
    "&::-webkit-scrollbar-corner": {
      backgroundColor: "transparent",
    },
  },
  listLimits: {
    maxHeight: "30vh",
    minHeight: "30vh",
    overflowY: "auto",
  },
  listEmpty: {
    marginTop: 10,
  },
  listItem: {
    padding: 0,
    margin: 2,
  },
  emptyListItem: {
    padding: 0,
    margin: 2,
    backgroundColor: 'transparent!important',
  },
  searchField: {
    marginBottom: 5,
  },
  '@global': {
    'li:nth-of-type(odd)': {
      backgroundColor: GREY,
    },
  },
});

export default styles;
