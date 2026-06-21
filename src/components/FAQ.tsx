import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "When and where is the tournament taking place?",
    answer: "The tournament starts on July 2nd. It will be held at the main sports complex in Shangla. Matches will run throughout the week, primarily in the evenings."
  },
  {
    question: "How can I register my team?",
    answer: "You can register your team by navigating to the 'Team Registration' tab. Fill out the required details including team name, captain, contact info, and player roster. A registration fee is required."
  },
  {
    question: "What is the registration fee and how do I pay?",
    answer: "The entry fee is Rs. 5000 per team. Payment instructions to send via Easypaisa will be displayed during the registration process."
  },
  {
    question: "How many players are allowed per team?",
    answer: "A team can register a minimum of 6 and a maximum of 12 players. Re-registration of players to different teams after the tournament begins is strictly prohibited."
  },
  {
    question: "How does the tournament format work?",
    answer: "The tournament begins with a group stage, followed by knockout rounds. Detailed bracket information will be available in the 'Schedule' tab once registrations close."
  },
  {
    question: "Are spectators allowed?",
    answer: "Yes! Spectators are welcome. You can purchase tickets through the 'Tickets' tab on this dashboard or at the venue entrance."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-500/10 p-4 rounded-full">
            <HelpCircle className="w-12 h-12 text-orange-500" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Frequently Asked Questions</h2>
        <p className="text-slate-400">Everything you need to know about the tournament.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-colors hover:border-slate-700"
          >
            <button 
              onClick={() => toggleAccordion(index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
            >
              <h3 className="font-bold text-lg text-white">{faq.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
              )}
            </button>
            <div 
              className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'py-4 border-t border-slate-800/50 max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <p className="text-slate-400">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
