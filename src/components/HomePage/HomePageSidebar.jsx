import React from "react";

function HomePageSidebar() {
  const features = [
    {
      id: 1,
      name: "Dashboard",
      description:
        "A unified dashboard to view and manage all activities in one place.",
      status: "Coming Soon",
    },
    {
      id: 2,
      name: "Reports",
      description:
        "Generate detailed reports to analyze and improve your performance.",
      status: "Coming Soon",
    },
    {
      id: 4,
      name: "Custom Alerts",
      description: "Set up personalized notifications for critical updates.",
      status: "Coming Soon",
    },
    {
      id: 5,
      name: "Collaboration Tools",
      description: "Enhance teamwork with real-time collaboration features.",
      status: "Coming Soon",
    },
  ];

  return (
    <div className="sidebar p-4">
      <h3 className="text-center text-green">New Features !</h3>
      {features.map((feature) => (
        <div key={feature.id} className="feature-item mb-3">
          <h5 className="text-green">{feature.name}</h5>
          <p>{feature.description}</p>
          <small>
            Status: <span className="text-green">{feature.status}</span>
          </small>
        </div>
      ))}
    </div>
  );
}

export default HomePageSidebar;
