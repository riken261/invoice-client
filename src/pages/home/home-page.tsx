import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HomePage: React.FC = () => {
  const nav = useNavigate();

  return (
    <>
      <Button
        onClick={() => {
          nav("/auth");
        }}
      >
        login
      </Button>
      <Button onClick={() => {}}>logout</Button>
      <Button
        onClick={() => {
          nav("/dashboard");
        }}
      >
        dashboard
      </Button>
    </>
  );
};

export { HomePage };
