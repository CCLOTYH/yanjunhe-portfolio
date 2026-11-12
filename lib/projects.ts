export type ProjectDetails = {
  background: string;
  objectives: string[];
  approach: string[];
};

export type Project = {
  slug: string;
  number: string;
  category: string;
  title: string;
  description: string;
  focusAreas: string[];
  href: string;
  details: ProjectDetails;
};

export const projects: Project[] = [
  {
    slug: "c103-last-mile-delivery",
    number: "01",
    category: "Academic Analytics Project",
    title: "C103 Last-Mile Delivery Network Optimization",
    description:
      "An academic analytics project studying last-mile delivery network decisions. The analysis weighed cost efficiency against emissions reduction and operational reliability — showing how network choices trade off what a delivery network costs, what it emits, and how dependably it performs. The results were translated into clear, data-driven business recommendations.",
    focusAreas: [
      "Logistics",
      "Network Optimization",
      "Cost Efficiency",
      "Emissions Reduction",
      "Operational Reliability",
    ],
    href: "/projects/c103-last-mile-delivery",
    details: {
      background:
        "Last-mile delivery is the stage of a logistics network where service, cost, and environmental impact meet. This academic analytics project examined the decisions behind a delivery network — how it is structured and operated — and what those decisions mean for cost efficiency, emissions, and day-to-day reliability.",
      objectives: [
        "Understand how delivery network decisions shape cost efficiency, emissions reduction, and operational reliability.",
        "Make the trade-offs between those dimensions explicit, instead of optimizing any one of them in isolation.",
        "Turn the analysis into data-driven recommendations that support real delivery-network decisions.",
      ],
      approach: [
        "Treated the delivery network as a set of connected decisions rather than a fixed given, so each choice could be examined on its own terms.",
        "Evaluated the network against three dimensions at once — cost, environmental impact, and operational stability — to expose where they align and where they conflict.",
        "Translated the analysis into business recommendations, connecting each finding to the decisions it should inform.",
      ],
    },
  },
  {
    slug: "cc-lot-website",
    number: "02",
    category: "Web Development & Digital Transformation",
    title: "CC-LOT Website Development",
    description:
      "A web development and digital transformation project: translating business requirements into website architecture and functionality, planning the development work, and iterating on the design through repeated review cycles. AI tools generated much of the implementation; my contribution was the planning, evaluation, and decision-making around it — reviewing every AI-generated change for quality, fit with the requirements, and business intent before it was accepted.",
    focusAreas: [
      "Website Architecture",
      "Requirements Planning",
      "AI-Assisted Development",
      "Design Iteration",
      "Quality Assurance",
    ],
    href: "/projects/cc-lot-website",
    details: {
      background:
        "CC-LOT is a web development and digital transformation project: taking a business's requirements for its website and turning them into working architecture and functionality. AI tools generated much of the implementation, which made planning, evaluation, and decision-making the core of the work.",
      objectives: [
        "Translate business requirements into website architecture and functionality that holds up in practice.",
        "Keep the design moving forward through structured iteration instead of one-off changes.",
        "Ensure every AI-generated implementation met the project's quality bar before being accepted.",
      ],
      approach: [
        "Planned the website's architecture and requirements up front, so every piece of functionality traced back to a business need.",
        "Used AI-assisted development to generate implementations, then reviewed each change against the requirements — evaluating quality, fit, and intent before accepting it.",
        "Iterated on the design through repeated review cycles, treating quality assurance as part of development rather than a final step.",
      ],
    },
  },
];
