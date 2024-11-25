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
      status: "In Development",
    },
    {
      id: 3,
      name: "Predictive AI",
      description:
        "AI-driven insights to predict future trends and opportunities.",
      status: "Planning Stage",
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
      status: "In Development",
    },
  ];

  return (
    <div className="sidebar">
      <h2>Features</h2>
      <ul>
        {features.map((feature) => (
          <li key={feature.id} className="feature-item">
            <h3>{feature.name}</h3>
            <p>{feature.description}</p>
            <small>Status: {feature.status}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePageSidebar;
