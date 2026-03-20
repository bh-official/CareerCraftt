"use client";

import { useState } from "react";
import {
  Award,
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function CareerDevelopment({
  certifications = [],
  skillsToDevelop = [],
  learningResources = [],
  networkingSuggestions = [],
  emergingSkills = [],
}) {
  const [openSections, setOpenSections] = useState({
    certifications: true,
    skills: false,
    resources: false,
    networking: false,
    emerging: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Certifications */}
      <SectionCard
        title="Recommended Certifications"
        icon={<Award className="w-5 h-5" />}
        isOpen={openSections.certifications}
        onToggle={() => toggleSection("certifications")}
        count={certifications.length}
        color="bg-amber-50 border-amber-200"
      >
        {certifications.length > 0 ? (
          <div className="space-y-3">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-amber-100 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-amber-900">{cert.name}</h5>
                    <p className="text-sm text-amber-700">{cert.provider}</p>
                  </div>
                  {cert.cost && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                      {cert.cost}
                    </span>
                  )}
                </div>
                <p className="text-sm text-amber-800 mt-2">{cert.impact}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-amber-700">
                  <ClockIcon />
                  <span>{cert.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No certifications suggested yet.</p>
        )}
      </SectionCard>

      {/* Skills to Develop */}
      <SectionCard
        title="Skills to Develop"
        icon={<TrendingUp className="w-5 h-5" />}
        isOpen={openSections.skills}
        onToggle={() => toggleSection("skills")}
        count={skillsToDevelop.length}
        color="bg-blue-50 border-blue-200"
      >
        {skillsToDevelop.length > 0 ? (
          <div className="space-y-3">
            {skillsToDevelop.map((skill, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-blue-100 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <h5 className="font-medium text-blue-900">{skill.skill}</h5>
                  {skill.salaryImpact && (
                    <div className="flex items-center gap-1 text-green-700 text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>{skill.salaryImpact}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-blue-800 mt-1">{skill.reason}</p>
                {skill.demand && (
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                      skill.demand === "high"
                        ? "bg-green-100 text-green-800"
                        : skill.demand === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {skill.demand} demand
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No skills suggested yet.</p>
        )}
      </SectionCard>

      {/* Learning Resources */}
      <SectionCard
        title="Learning Resources"
        icon={<BookOpen className="w-5 h-5" />}
        isOpen={openSections.resources}
        onToggle={() => toggleSection("resources")}
        count={learningResources.length}
        color="bg-purple-50 border-purple-200"
      >
        {learningResources.length > 0 ? (
          <div className="space-y-3">
            {learningResources.map((resource, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-purple-100 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-purple-900">
                      {resource.name}
                    </h5>
                    <p className="text-sm text-purple-700">
                      {resource.provider}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {resource.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-purple-700">
                  <span>{resource.duration}</span>
                  <span>•</span>
                  <span>{resource.cost}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No learning resources suggested yet.</p>
        )}
      </SectionCard>

      {/* Networking */}
      <SectionCard
        title="Networking Suggestions"
        icon={<Users className="w-5 h-5" />}
        isOpen={openSections.networking}
        onToggle={() => toggleSection("networking")}
        count={networkingSuggestions.length}
        color="bg-green-50 border-green-200"
      >
        {networkingSuggestions.length > 0 ? (
          <div className="space-y-3">
            {networkingSuggestions.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-green-100 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <h5 className="font-medium text-green-900">
                    {item.strategy}
                  </h5>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : item.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.priority} priority
                  </span>
                </div>
                <p className="text-sm text-green-800 mt-1">{item.platform}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No networking suggestions yet.</p>
        )}
      </SectionCard>

      {/* Emerging Skills */}
      {emergingSkills && emergingSkills.length > 0 && (
        <SectionCard
          title="Emerging Skills"
          icon={<TrendingUp className="w-5 h-5" />}
          isOpen={openSections.emerging}
          onToggle={() => toggleSection("emerging")}
          count={emergingSkills.length}
          color="bg-cyan-50 border-cyan-200"
        >
          <div className="space-y-3">
            {emergingSkills.map((skill, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-cyan-100 rounded-lg"
              >
                <h5 className="font-medium text-cyan-900">{skill.skill}</h5>
                <p className="text-sm text-cyan-800 mt-1">{skill.trend}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs">
                  Essential by: {skill.timeline}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  isOpen,
  onToggle,
  count,
  color,
  children,
}) {
  return (
    <div className={`border rounded-lg overflow-hidden ${color}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="px-2 py-0.5 bg-white bg-opacity-50 rounded-full text-sm">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-opacity-30">{children}</div>
      )}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
