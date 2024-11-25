import React from "react";

function HomePageMainContent() {
  const mainContent = {
    title: "Welcome to the Dashboard",
    description:
      "Here you can find all the essential insights and manage your tasks efficiently.",
    highlights: [
      "Track your performance with real-time analytics.",
      "Generate detailed reports on the go.",
      "Utilize AI-driven predictions for strategic planning.",
    ],
  };

  return (
    <div className="d-flex align-items-center justify-content-center">
      <div className="container">
        <h1>Hello User !</h1>
      </div>
    </div>
  );
}

export default HomePageMainContent;
