import { createElement } from "react";

const IMAGE_URLS = {
  React: "https://ik.imagekit.io/bqzlidc77g/my%20portfolio/tech/reactjs.png?updatedAt=1749961105057",
  "React.js": "https://ik.imagekit.io/bqzlidc77g/my%20portfolio/tech/reactjs.png?updatedAt=1749961105057",
  Node: "https://ik.imagekit.io/bqzlidc77g/my%20portfolio/tech/nodejs.png?updatedAt=1749961104709",
  "Node.js": "https://ik.imagekit.io/bqzlidc77g/my%20portfolio/tech/nodejs.png?updatedAt=1749961104709",
  Mongo: "https://ik.imagekit.io/bqzlidc77g/my%20portfolio/tech/mongodb.png?updatedAt=1749961104590",
  MongoDB: "https://ik.imagekit.io/bqzlidc77g/my%20portfolio/tech/mongodb.png?updatedAt=1749961104590",
  Docker: "https://ik.imagekit.io/bqzlidc77g/my%20portfolio/tech/docker.png?updatedAt=1749961103144",
  Tailwind: "https://ik.imagekit.io/bqzlidc77g/my%20portfolio/tech/tailwind.png?updatedAt=1749961111586",
  "Tailwind CSS": "https://ik.imagekit.io/bqzlidc77g/my%20portfolio/tech/tailwind.png?updatedAt=1749961111586",
  Lambda: "/assets/lambda.svg",
  "AWS Lambda": "/assets/lambda.svg",
  "API Gateway": "/assets/api-gateway.svg",
  "AWS API Gateway": "/assets/api-gateway.svg",
  DynamoDB: "/assets/dynamodb.svg",
  "AWS DynamoDB": "/assets/dynamodb.svg",
  S3: "/assets/s3.svg",
  "S3 Bucket": "/assets/s3.svg",
  EC2: "/assets/ec2.svg",
  Cognito: "/assets/cognito.svg",
  "AWS Cognito": "/assets/cognito.svg",
};

const BADGE_LABELS = {
  Next: "NX",
  "Next.js": "NX",
  Express: "EX",
  "Express.js": "EX",
  Nest: "NS",
  "Nest.js": "NS",
  Redux: "RED",
  GraphQL: "GQL",
  "REST APIs": "API",
  WebSockets: "WS",
  JWT: "JWT",
  OAuth2: "O2",
  "HTTPS/SSL": "SSL",
  "API Gateway": "API",
  "AWS API Gateway": "API",
  DynamoDB: "DB",
  "AWS DynamoDB": "DB",
  S3: "S3",
  "S3 Bucket": "S3",
  EC2: "EC2",
  Cognito: "COG",
  "AWS Cognito": "COG",
  AWS: "AWS",
};

export function getTechIconConfig(tech) {
  if (IMAGE_URLS[tech]) {
    return { type: "image", src: IMAGE_URLS[tech], alt: tech };
  }

  if (BADGE_LABELS[tech]) {
    return { type: "badge", label: BADGE_LABELS[tech] };
  }

  return { type: "badge", label: tech.slice(0, 3).toUpperCase() };
}

export function TechIcon({ tech, size = 26, color = "#A78BFA" }) {
  const icon = getTechIconConfig(tech);

  if (icon.type === "image") {
    return createElement("img", {
      src: icon.src,
      alt: icon.alt,
      style: {
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
      },
    });
  }

  return createElement(
    "div",
    {
      style: {
        width: size,
        height: size,
        borderRadius: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${color}33, rgba(255,255,255,0.04))`,
        border: `1px solid ${color}66`,
        color: "#fff",
        fontSize: Math.max(9, Math.floor(size * 0.32)),
        fontWeight: 800,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        boxShadow: `0 0 18px ${color}22`,
      },
    },
    icon.label,
  );
}