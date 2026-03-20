"use client";

import { useState } from "react";
import {
  HelpCircle,
  User,
  Building,
  DollarSign,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Lightbulb,
} from "lucide-react";

export default function InterviewPrep({
  technicalQuestions = [],
  behavioralQuestions = [],
  culturalFitPoints = [],
  questionsToAsk = [],
  salaryPrep = {},
  weaknessStrategies = [],
}) {
  const [openSections, setOpenSections] = useState({
    technical: true,
    behavioral: false,
    cultural: false,
    questions: false,
    salary: false,
    weaknesses: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Technical Questions */}
      <SectionCard
        title="Technical Questions"
        icon={<HelpCircle className="w-5 h-5" />}
        isOpen={openSections.technical}
        onToggle={() => toggleSection("technical")}
        count={technicalQuestions.length}
      >
        {technicalQuestions.length > 0 ? (
          <div className="space-y-4">
            {technicalQuestions.map((q, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">{q.question}</h5>
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Difficulty:</span>{" "}
                  {q.difficulty}
                </div>
                {q.answer && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Suggested Approach:
                    </p>
                    <p className="text-sm text-blue-800 whitespace-pre-line">
                      {q.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No technical questions generated yet.</p>
        )}
      </SectionCard>

      {/* Behavioral Questions */}
      <SectionCard
        title="Behavioral Questions"
        icon={<User className="w-5 h-5" />}
        isOpen={openSections.behavioral}
        onToggle={() => toggleSection("behavioral")}
        count={behavioralQuestions.length}
      >
        {behavioralQuestions.length > 0 ? (
          <div className="space-y-4">
            {behavioralQuestions.map((q, index) => (
              <div key={index} className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <h5 className="font-medium text-purple-900">{q.question}</h5>
                  <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">
                    {q.category}
                  </span>
                </div>
                {q.starFramework && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-sm font-medium text-purple-900 mb-2">
                      STAR Method:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">S:</span> Situation
                      </div>
                      <div>
                        <span className="font-medium">T:</span> Task
                      </div>
                      <div>
                        <span className="font-medium">A:</span> Action
                      </div>
                      <div>
                        <span className="font-medium">R:</span> Result
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No behavioral questions generated yet.
          </p>
        )}
      </SectionCard>

      {/* Cultural Fit */}
      <SectionCard
        title="Cultural Fit Talking Points"
        icon={<Building className="w-5 h-5" />}
        isOpen={openSections.cultural}
        onToggle={() => toggleSection("cultural")}
        count={culturalFitPoints.length}
      >
        {culturalFitPoints.length > 0 ? (
          <div className="space-y-3">
            {culturalFitPoints.map((point, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-900">{point.topic}</h5>
                <p className="text-sm text-green-800 mt-1">{point.reason}</p>
                {point.suggestedPoints && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {point.suggestedPoints.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No cultural fit points generated yet.</p>
        )}
      </SectionCard>

      {/* Questions to Ask */}
      <SectionCard
        title="Questions to Ask the Interviewer"
        icon={<MessageSquare className="w-5 h-5" />}
        isOpen={openSections.questions}
        onToggle={() => toggleSection("questions")}
        count={questionsToAsk.length}
      >
        {questionsToAsk.length > 0 ? (
          <div className="space-y-2">
            {questionsToAsk.map((q, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg"
              >
                <span className="w-6 h-6 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="text-yellow-900">{q.question}</p>
                  <span className="text-xs text-yellow-700">{q.category}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No questions generated yet.</p>
        )}
      </SectionCard>

      {/* Salary Preparation */}
      {salaryPrep && Object.keys(salaryPrep).length > 0 && (
        <SectionCard
          title="Salary Negotiation Prep"
          icon={<DollarSign className="w-5 h-5" />}
          isOpen={openSections.salary}
          onToggle={() => toggleSection("salary")}
        >
          <div className="space-y-4">
            {salaryPrep.researchTips && salaryPrep.researchTips.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  Research Tips
                </h5>
                <ul className="space-y-1">
                  {salaryPrep.researchTips.map((tip, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {salaryPrep.negotiationPoints &&
              salaryPrep.negotiationPoints.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Negotiation Points
                  </h5>
                  <ul className="space-y-1">
                    {salaryPrep.negotiationPoints.map((point, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <ChevronRight className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </SectionCard>
      )}

      {/* Weakness Strategies */}
      {weaknessStrategies && weaknessStrategies.length > 0 && (
        <SectionCard
          title="Addressing Potential Weaknesses"
          icon={<User className="w-5 h-5" />}
          isOpen={openSections.weaknesses}
          onToggle={() => toggleSection("weaknesses")}
          count={weaknessStrategies.length}
        >
          <div className="space-y-3">
            {weaknessStrategies.map((item, index) => (
              <div key={index} className="p-3 bg-red-50 rounded-lg">
                <h5 className="font-medium text-red-900">{item.weakness}</h5>
                <p className="text-sm text-red-800 mt-1">{item.strategy}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function SectionCard({ title, icon, isOpen, onToggle, count, children }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && (
            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-sm">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </button>
      {isOpen && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  );
}
