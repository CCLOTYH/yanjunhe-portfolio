import type { Metadata } from "next";
import Link from "next/link";
import { LanguageRating } from "@/components/language-rating";
import { RacingStripes } from "@/components/racing-stripes";

export const metadata: Metadata = {
  title: "About Me — Yanjun He",
  description:
    "Educational background, professional experience, and interests of Yanjun He, a Business Analytics graduate student at Santa Clara University.",
};

type EducationItem = {
  school: string;
  degree: string;
  period: string;
  detail: string;
  tags: string[];
  dark: boolean;
  coursework?: string[];
};

const education: EducationItem[] = [
  {
    school: "Santa Clara University — Leavey School of Business",
    degree: "Master of Science in Business Analytics",
    period: "Expected December 2026 · GPA 3.5",
    detail:
      "Currently pursuing my master's degree in the heart of Silicon Valley, moving from framing the business question to modeling the data and communicating the result.",
    tags: [
      "Statistical Modeling",
      "Data Visualization",
      "Machine Learning",
      "Deep Learning",
      "Database Management",
    ],
    dark: true,
  },
  {
    school: "Marquette University",
    degree: "Bachelor of Science in Finance",
    period: "May 2025 · GPA 3.0",
    detail:
      "Graduated as a scholarship recipient with a foundation in finance — the business context I now bring to every analytics problem.",
    tags: ["Finance", "Scholarship Recipient"],
    coursework: ["Accounting", "Entrepreneurship", "Real Estate"],
    dark: true,
  },
];

const experience = [
  {
    role: "Customer Insights & Predictive Analytics Practicum",
    org: "Santa Clara University × LatentView",
    period: "January 2026 – June 2026",
    bullets: [
      "Developed an early dormancy detection framework for a subscription-based digital product client.",
      "Analyzed datasets exceeding 5 million rows using Python, with data cleaning, exploratory data analysis, feature engineering, and model preparation.",
      "Created more than 40 behavioral, marketing, churn, ecosystem, and temporal features.",
      "Evaluated Logistic Regression, XGBoost, LightGBM, Random Forest, and CatBoost.",
      "Translated analytical findings into customer retention and lifecycle marketing recommendations.",
    ],
  },
  {
    role: "Sales Intern",
    org: "Invesco Great Wall Fund Management",
    period: "December 2024 – February 2025",
    bullets: [
      "Analyzed fund sales, subscription/redemption flows, and channel-level holdings using Excel.",
      "Prepared financial product comparisons and reports for bank-channel presentations.",
      "Used Wind and Bloomberg to research AI supply chains, semiconductor demand, memory cycles, and optical transceiver markets.",
      "Supported client inquiries, CRM updates, and relationship follow-ups.",
    ],
  },
  {
    role: "International Project Assistant",
    org: "Yufing (Guangdong) Lighting Technology",
    period: "May 2023 – September 2024",
    bullets: [
      "Evaluated automotive LED lighting products against international customer requirements.",
      "Reviewed electrical and optical specifications, including luminous flux, illuminance, beam patterns, and glare control.",
      "Helped prepare quotations and product configuration recommendations.",
      "Coordinated sample-development feedback and technical requirement clarification with R&D teams.",
    ],
  },
];

const exhibitions = [
  {
    event: "INA PAACE Automechanika Mexico 2026",
    brand: "Yufing / CC-LOT",
    location: "Mexico City, Mexico",
    dates: "July 8–10, 2026",
    intro:
      "Supported the Yufing / CC-LOT booth across three days of the automotive aftermarket exhibition. The team spoke with many companies and recorded several priority leads for follow-up.",
    bullets: [
      "Assisted with presenting automotive LED lighting products and explaining product advantages to international visitors.",
      "Helped visitors identify suitable product configurations based on application requirements, product characteristics, and technical specifications.",
      "Discussed product interests and purchasing requirements with prospective customers.",
      "Collected business cards, contact details, inquiries, and product preferences for subsequent business follow-up.",
      "Gained practical exposure to automotive aftermarket distribution, international buyer expectations, and product positioning.",
    ],
    tags: ["Automotive Aftermarket", "Customer Communication", "Product Knowledge"],
  },
  {
    event: "Automotive Aftermarket Products Expo (AAPEX) 2026",
    brand: "Yufing / CC-LOT",
    location: "Las Vegas, Nevada, USA",
    dates: "November 3–5, 2026",
    intro:
      "Joined the Yufing / CC-LOT team at the AAPEX exhibition in Las Vegas, focused on the North American automotive aftermarket.",
    bullets: [
      "Participated in industry and product discussions involving automotive lighting solutions.",
      "Communicated with retail and wholesale industry representatives about product characteristics and application requirements.",
      "Observed differences between buyer requirements, distribution channels, and aftermarket product positioning.",
      "Helped organize customer contact information, product interests, and discussion notes for possible follow-up.",
      "Gained firsthand exposure to the North American automotive aftermarket and purchasing considerations.",
    ],
    tags: ["Automotive Aftermarket", "Market Insights", "Customer Communication"],
  },
];

const skillGroups = [
  {
    category: "Data & BI",
    skills: ["SQL", "Python", "Excel", "Tableau", "Power BI", "RStudio"],
  },
  {
    category: "Python & Machine Learning",
    skills: [
      "pandas",
      "NumPy",
      "scikit-learn",
      "Keras",
      "Logistic Regression",
      "XGBoost",
      "CatBoost",
      "model evaluation",
    ],
  },
  {
    category: "Research & Business Analysis",
    skills: [
      "Exploratory Data Analysis",
      "Customer Segmentation",
      "KPI Tracking",
      "Market Research",
      "Competitive Analysis",
      "Data Visualization",
    ],
  },
  {
    category: "Finance & Industry Research",
    skills: ["Wind", "Bloomberg", "Financial Product Research"],
  },
  {
    category: "Design & Prototyping",
    skills: [
      "Autodesk Fusion 360",
      "basic CAD modeling",
      "prototype iteration",
    ],
  },
];

const interests = [
  {
    title: "Photography & drone piloting",
    description:
      "Shooting photos and piloting UAVs trains the same eye I use for data visualization: framing, clarity, and knowing what to leave out.",
  },
  {
    title: "Track driving",
    description:
      "Track days sharpened my appreciation for precision, preparation, and making good decisions under pressure.",
  },
  {
    title: "Japanese language & culture",
    description:
      "I study Japanese and enjoy exploring the language and culture through media and travel.",
  },
  {
    title: "Community & media",
    description:
      "At Marquette I led a media team producing live broadcasts for the Chinese Students & Scholars Association, supporting audience engagement.",
  },
  {
    title: "Fusion 360 & hands-on prototyping",
    description:
      "I taught myself Autodesk Fusion 360 to design and refine a three-jaw display fixture for automotive LED bulbs. Through measurements, PLA 3D printing, and approximately four to five design iterations, I worked with my roommate to improve fit and usability.",
    wide: true,
    extra:
      "I also explored modular display concepts through the CC-LOT FlowDock project, including interchangeable mounting components and CAD/STEP validation of selected prototype assemblies.",
  },
];

const languages = [
  { name: "Cantonese", score: 5 },
  { name: "Mandarin Chinese", score: 5 },
  { name: "English", score: 5 },
  { name: "Japanese", score: 2 },
];

export default function AboutMe() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-80 xl:block"
        >
          <span className="absolute -top-24 -bottom-24 right-24 w-14 -skew-x-12 bg-racing-orange" />
          <span className="absolute -top-24 -bottom-24 right-10 w-8 -skew-x-12 bg-racing-red" />
          <span className="absolute -top-24 -bottom-24 right-0 w-3 -skew-x-12 bg-white/40" />
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-6 pb-20 pt-20">
          <p className="inline-flex w-fit items-center rounded-full bg-racing-orange px-3 py-1 text-xs font-semibold text-charcoal">
            About me
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            The person behind the analysis.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            I&apos;m a Business Analytics graduate student at Santa Clara
            University&apos;s Leavey School of Business. Before analytics, I
            studied finance — and I still approach every dataset the same way:
            what decision does this inform?
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            Education
          </h2>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {education.map((item) => (
            <article
              key={item.school}
              className={`flex flex-col gap-4 rounded-2xl border p-8 transition-colors hover:shadow-md ${
                item.dark
                  ? "border-navy bg-navy hover:border-racing-orange/60"
                  : "border-navy/10 bg-white hover:border-racing-orange/60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      item.dark ? "text-white" : "text-charcoal"
                    }`}
                  >
                    {item.school}
                  </h3>
                  <p
                    className={`mt-1 ${item.dark ? "text-white/70" : "text-zinc-600"}`}
                  >
                    {item.degree}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    item.dark
                      ? "bg-racing-orange text-charcoal"
                      : "bg-navy/5 text-navy"
                  }`}
                >
                  {item.period}
                </span>
              </div>
              <p
                className={`leading-7 ${item.dark ? "text-white/70" : "text-zinc-600"}`}
              >
                {item.detail}
              </p>
              {item.coursework ? (
                <div className="mt-auto flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                    Relevant Coursework
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {item.coursework.map((course) => (
                      <li
                        key={course}
                        className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/85"
                      >
                        {course}
                      </li>
                    ))}
                  </ul>
                  <ul className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/85"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ul className="mt-auto flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        item.dark
                          ? "border-white/25 text-white/85"
                          : "border-navy/15 text-charcoal"
                      }`}
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            Professional Experience
          </h2>
        </div>
        <div className="mt-6 flex flex-col gap-6">
          {experience.map((item) => (
            <article
              key={item.role}
              className="flex flex-col gap-4 rounded-2xl border border-navy/10 border-l-4 border-l-navy bg-white p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal">
                    {item.role}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-navy">{item.org}</p>
                </div>
                <span className="shrink-0 rounded-full bg-navy/5 px-3 py-1 text-xs font-medium text-navy">
                  {item.period}
                </span>
              </div>
              <ul className="space-y-2.5">
                {item.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-3 text-sm leading-6 text-zinc-700"
                  >
                    <span
                      aria-hidden
                      className="mt-2 block h-1.5 w-3 shrink-0 -skew-x-12 bg-racing-orange"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            Industry Exhibitions &amp; Market Engagement
          </h2>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {exhibitions.map((item) => (
            <article
              key={item.event}
              className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white"
            >
              <div className="flex flex-col justify-center bg-navy px-8 py-5 lg:min-h-[7.5rem]">
                <h3 className="text-lg font-semibold leading-snug text-white">
                  {item.event}
                </h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-racing-orange">
                  {item.brand}
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-racing-orange/15 px-3 py-1 text-xs font-medium text-charcoal">
                    {item.dates}
                  </span>
                  <span className="rounded-full bg-racing-red/10 px-3 py-1 text-xs font-medium text-charcoal">
                    {item.location}
                  </span>
                </div>
                <p className="leading-7 text-zinc-600">{item.intro}</p>
                <ul className="space-y-2.5">
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-3 text-sm leading-6 text-zinc-700"
                    >
                      <span
                        aria-hidden
                        className="mt-2 block h-1.5 w-3 shrink-0 -skew-x-12 bg-racing-orange"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <ul className="mt-auto flex flex-wrap gap-2 pt-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-navy/15 px-3 py-1 text-xs text-charcoal"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            Technical Skills
          </h2>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {skillGroups.map((group) => (
            <article
              key={group.category}
              className="rounded-2xl border border-navy/10 bg-white p-6"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-navy">
                {group.category}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-navy/15 px-3 py-1 text-xs text-charcoal"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            Beyond the Classroom
          </h2>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {interests.map((interest) => (
            <article
              key={interest.title}
              className={`rounded-2xl border border-navy/10 bg-white p-8 ${interest.wide ? "sm:col-span-2" : ""}`}
            >
              <h3 className="text-lg font-semibold text-charcoal">
                {interest.title}
              </h3>
              <p className="mt-2 leading-7 text-zinc-600">
                {interest.description}
              </p>
              {interest.extra && (
                <p className="mt-3 leading-7 text-zinc-600">{interest.extra}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            Languages
          </h2>
        </div>
        <p className="mt-3 text-sm font-medium text-zinc-500">
          Self-assessed proficiency
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {languages.map((language) => (
            <div
              key={language.name}
              className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-lg font-semibold text-charcoal">
                {language.name}
              </span>
              <LanguageRating name={language.name} score={language.score} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-navy p-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <RacingStripes dark className="mb-3" />
            <h2 className="text-xl font-semibold text-white">
              Curious what I&apos;ve built?
            </h2>
            <p className="mt-1 text-white/70">
              Explore the delivery-network and website projects in my portfolio.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white"
          >
            View projects
          </Link>
        </div>
      </section>
    </>
  );
}
