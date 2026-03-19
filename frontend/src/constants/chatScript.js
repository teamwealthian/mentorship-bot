export const DEFAULT_LANGUAGE = 'English'
export const HINDI_LANGUAGE = 'Hindi'

export const QUICK_REPLIES_BY_LANGUAGE = {
  [DEFAULT_LANGUAGE]: ['Course details', 'Fees', 'Who is it for?', 'Talk to an advisor'],
  [HINDI_LANGUAGE]: ['Course details', 'Fees', 'Yeh kiske liye hai?', 'Advisor se baat karni hai'],
}

export const SCRIPT_FLOW_BY_LANGUAGE = {
  [DEFAULT_LANGUAGE]: {
    initialNodeId: 'experience_check',
    nodes: {
      experience_check: {
        assistantMessages: [
          'Hello! Kundan here.',
          "Before we move ahead with the mentorship, I'd like to know-have you traded options before?",
        ],
        options: ['Yes', 'No'],
        nextByOption: {
          Yes: 'loss_check',
          No: 'no_experience',
        },
      },
      no_experience: {
        assistantMessages: [
          "That means you want to learn first and then start - that's a great approach.",
          'Let me guide you step by step so you can become a confident options trader.',
        ],
        completionMode: 'ai_intro',
      },
      loss_check: {
        assistantMessages: ['Have you made any loss in options trading?'],
        options: ['Yes', 'No'],
        nextByOption: {
          Yes: 'loss_amount',
          No: 'no_loss',
        },
      },
      no_loss: {
        assistantMessages: [
          'That’s great. Most people who trade options end up making losses.',
          'Since you are already profitable, tell me - how can I help you further?',
        ],
        completionMode: 'composer',
      },
      loss_amount: {
        assistantMessages: ['How much loss have you made?'],
        options: ['Less than ₹1 Lakh', 'More than ₹1 Lakh'],
        nextByOption: {
          'Less than ₹1 Lakh': 'loss_under_one_lakh',
          'More than ₹1 Lakh': 'loss_over_one_lakh',
        },
      },
      loss_under_one_lakh: {
        assistantMessages: [
          'It’s okay. As per SEBI reports, 91% of traders lose money, and the average loss is more than ₹1.5 lakh.',
          'With the right learning and practice, you can recover your loss and become consistent.',
        ],
        completionMode: 'ai_intro',
      },
      loss_over_one_lakh: {
        assistantMessages: [
          'I understand. But you are not alone.',
          'As per SEBI reports, 91% of traders lose money, and the average loss is more than ₹1.5 lakh.',
          'With the right learning and practice, you can recover your loss and trade with confidence.',
        ],
        completionMode: 'ai_intro',
      },
    },
  },
  [HINDI_LANGUAGE]: {
    initialNodeId: 'experience_check',
    nodes: {
      experience_check: {
        assistantMessages: [
          'Hello! Kundan here.',
          'Aage mentorship continue karne se pehle, main yeh samajhna chahta hoon - kya aapne kabhi Options Trading ki hai?',
        ],
        options: ['Yes', 'No'],
        nextByOption: {
          Yes: 'loss_check',
          No: 'no_experience',
        },
      },
      no_experience: {
        assistantMessages: [
          'Iska matlab hai ki aap pehle seekhna chahte ho aur phir start karna - yeh ek bahut achha approach hai.',
          'Main aapko step by step guide karunga taaki aap ek confident options trader ban pao.',
        ],
        completionMode: 'ai_intro',
      },
      loss_check: {
        assistantMessages: ['Kya aapko Options Trading mein loss hua hai?'],
        options: ['Yes', 'No'],
        nextByOption: {
          Yes: 'loss_amount',
          No: 'no_loss',
        },
      },
      no_loss: {
        assistantMessages: [
          'Bahut badhiya. Majority log jo trading karte hain, loss karte hain.',
          'Since aap already profitable ho, batayein - main aapki kaise help kar sakta hoon?',
        ],
        completionMode: 'composer',
      },
      loss_amount: {
        assistantMessages: ['Aapne approx kitna loss kiya hai?'],
        options: ['₹1 Lakh se kam', '₹1 Lakh se zyada'],
        nextByOption: {
          '₹1 Lakh se kam': 'loss_under_one_lakh',
          '₹1 Lakh se zyada': 'loss_over_one_lakh',
        },
      },
      loss_under_one_lakh: {
        assistantMessages: [
          'Koi baat nahi. SEBI ke report ke according, 91% traders loss karte hain, aur average loss ₹1.5 lakh se bhi zyada hota hai.',
          'Sahi learning aur practice ke saath, aap apna loss recover kar sakte ho.',
        ],
        completionMode: 'ai_intro',
      },
      loss_over_one_lakh: {
        assistantMessages: [
          'Samajh sakta hoon. Lekin aap akela nahi ho.',
          'SEBI ke report ke according, 91% traders loss karte hain, aur average loss ₹1.5 lakh se bhi zyada hota hai.',
          'Sahi learning aur practice ke saath, aap recovery kar sakte ho aur confident trading kar sakte ho.',
        ],
        completionMode: 'ai_intro',
      },
    },
  },
}

export const buildPostScriptMessages = ({ courseTitle, preferredLanguage }) => {
  if (preferredLanguage === HINDI_LANGUAGE) {
    return [
      `${courseTitle} mein aapki dilchaspi dekhkar accha laga.`,
      'Aap sabse pehle kya jaan na chahenge?',
    ]
  }

  return [`Welcome! Great to see your interest in ${courseTitle}.`, 'What would you like to explore first?']
}
