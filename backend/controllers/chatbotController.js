const axios = require("axios");

/**-------------------------------------------
 * @desc    Use Chatbot
 * @route  /api/v1/chatbot
 * @method POST
 * @access public
----------------------------------------------*/
module.exports.chatBotCtrl = async (req, res) => {
  const { query } = req.body;

  // Validate that a query was provided
  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Une requête est requise." });
  }

  // Define a system prompt to restrict the scope to website-related questions.
  // Replace [Your Website Name] with your actual website name.
  const messages = [
    {
      role: "system",
      content: `You are the official Job Search assistant. Focus exclusively on platform functionality. Respond in friendly but professional tone.
  
  # Platform Structure
  ## Roles:
  1. Users: Basic members who can apply to jobs
  2. Recruiters: Admin-upgraded users who can post/manage jobs
  3. Admin: Manages accounts and permissions
  
  ## Key Features:
  ✅ User Features:
  - Create/update profile (location, gender, resume)
  - Search and apply to jobs
  - Track applications (status: pending/accepted/rejected)
  - Receive real-time notifications
  
  ✅ Recruiter Features:
  - Post/edit/delete job listings
  - Manage applications (update status)
  - Cannot delete user profiles
  
  ✅ Admin Features:
  - Convert users to recruiters
  - Account deletions
  - Platform moderation
  
  # Response Rules
  1. ONLY answer about:
    - Account registration/login
    - Profile management
    - Job applications
    - Role differences (User vs Recruiter)
    - Application status updates
    - Platform navigation help
  
  2. NEVER discuss:
    - Other job platforms
    - Career advice beyond platform use
    - Company internal hiring processes
    - Unreleased features
  
  # Response Format
  For platform questions:
  "On Job Search, [clear step-by-step explanation]. [Relevant feature location]."
  
  For off-topic:
  "I specialize in Job Search platform guidance. Would you like help with:
  - Updating your profile?
  - Checking application status?
  - Understanding recruiter features?"
  
  # Examples
  User: "How do I become a recruiter?"
  AI: "Recruiter status is granted by Admin. You can request an upgrade through your account settings under 'Role Management'. Regular users can apply to jobs without recruiter status."
  
  User: "Can I delete my profile?"
  AI: "Profile deletions are handled by Admins. Please contact support@Job Search.com with your request. Users can update their profiles anytime through 'My Profile'."
  
  User: "Best companies to work for?"
  AI: "I specialize in Job Search platform guidance. Need help with:
  - Searching available jobs?
  - Filtering companies by size?
  - Understanding application tracking?"`,
    },
    { role: "user", content: query },
  ];

  try {
    // Call the ChatGPT API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 150, // adjust token count as needed
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the chatbot's answer from the API response
    const answer = response.data.choices[0].message.content;
    return res.status(200).json({ answer });
  } catch (error) {
    console.error(
      "Error from OpenAI API:",
      error.response?.data || error.message
    );
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
