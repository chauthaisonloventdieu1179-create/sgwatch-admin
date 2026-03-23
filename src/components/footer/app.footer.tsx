"use client";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
const AppFooter = () => {
  return (
    <div >
      <AppBar
        color="primary"
        sx={{
          top: "auto",
          bottom: 0,
          background: "#FFFFFF",
          boxShadow: "none",
        }}
      >
        <Container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 100,
              height: "30px",
            }}
          >
            <div
              style={{
                color: "#C8C8C8",
                fontFamily: "Source Han Sans JP, sans-serif",
                fontSize: "10px",
                fontWeight: "500",
              }}
            >
              © 2024 TAMAYURA Co., Ltd.
            </div>
          </div>
        </Container>
      </AppBar>
    </div>
  );
};
export default AppFooter;
