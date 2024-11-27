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
    <div className="d-flex align-items-center justify-content-center h-100">
      <div className="container d-flex  flex-column align-items-center justify-content-center h-100">
        <h1>
          Hello <span className="text-green">User</span> !!!!
        </h1>
        <h3>
          Welcome to <span className="text-green">Agino</span>
        </h3>
      </div>
    </div>
  );
}

export default HomePageMainContent;
