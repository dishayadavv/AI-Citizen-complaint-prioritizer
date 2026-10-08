import {
  Component
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';

import {
  Router
} from '@angular/router';


/* =========================================================
   COMPLAINT DATA
========================================================= */

interface ComplaintData {

  id?: string;

  title?: string;

  status: string;

  priority: string;

  score: number;

  category: string;

  location: string;

  date: string;

  resolution: number | null;

  aiReasons: string[];

  detectedFactors: string[];

  recommendedAction: string;

}


/* =========================================================
   CITIZEN COMPLAINT
========================================================= */

interface CitizenComplaint {

  _id: string;

  title: string;

  category: string;

  status: string;

  priorityLevel?: string;

  priorityScore?: number;

  aiScore?: number;

  createdAt?: string;

  predictedResolutionTime?: number;

  aiReasons?: string[];

  detectedFactors?: string[];

  recommendedAction?: string;

  location?: {

    address?: string;

  };

}


/* =========================================================
   CHAT MESSAGE
========================================================= */

interface ChatMessage {

  sender: 'bot' | 'user';

  text: string;

  time: string;

  complaintData?: ComplaintData;

  citizenComplaints?: CitizenComplaint[];

}


/* =========================================================
   CHAT INTENTS
========================================================= */

type ChatIntent =

  | 'greeting'

  | 'cityfix-info'

  | 'report'

  | 'track'

  | 'my-complaints'

  | 'unresolved'

  | 'status'

  | 'priority'

  | 'category'

  | 'photo'

  | 'location'

  | 'login'

  | 'register'

  | 'help'

  | 'thanks'

  | 'unknown';


/* =========================================================
   COMPONENT
========================================================= */

@Component({

  selector: 'app-cityfix-chatbot',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule

  ],

  templateUrl:
    './cityfix-chatbot.html',

  styleUrls: [

    './cityfix-chatbot.css'

  ]

})


export class CityfixChatbotComponent {


  /* =======================================================
     STATE
  ======================================================= */

  isOpen = false;

  userMessage = '';

  isTyping = false;

  waitingForComplaintId = false;


  /* =======================================================
     CONVERSATION CONTEXT
  ======================================================= */

  private lastIntent = '';

  private currentComplaint:
    CitizenComplaint | null = null;

  private citizenComplaints:
    CitizenComplaint[] = [];


  /* =======================================================
     API
  ======================================================= */

  private apiUrl =
    'http://localhost:5000/api/complaints';

  private chatApiUrl =
    'http://localhost:5000/api/chat';


  /* =======================================================
     MESSAGES
  ======================================================= */

  messages: ChatMessage[] = [

    {

      sender: 'bot',

      text:
        'Hi! I’m CityFix AI 👋 I can help you report civic issues, track complaints, understand complaint status, view your complaints, and navigate the CityFix platform.',

      time:
        this.getCurrentTime()

    }

  ];


  /* =======================================================
     QUICK QUESTIONS
  ======================================================= */

  quickQuestions = [

    'How do I report an issue?',

    'Track my complaint',

    'My complaints',

    'What can I report?'

  ];


  /* =======================================================
     CONSTRUCTOR
  ======================================================= */

  constructor(

    private http: HttpClient,

    private router: Router

  ) {}


  /* =======================================================
     OPEN / CLOSE CHAT
  ======================================================= */

  toggleChat(): void {

    this.isOpen =
      !this.isOpen;

  }


  closeChat(): void {

    this.isOpen = false;

  }


  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  sendMessage(): void {

    const text =
      this.userMessage.trim();


    if (!text) {

      return;

    }


    this.messages.push({

      sender: 'user',

      text: text,

      time:
        this.getCurrentTime()

    });


    this.userMessage = '';


    /* -------------------------------------------------------
       COMPLAINT ID
    ------------------------------------------------------- */

    if (
      this.waitingForComplaintId
    ) {

      this.waitingForComplaintId =
        false;

      this.trackComplaint(
        text
      );

      return;

    }


    const lowerText =
      text
        .toLowerCase()
        .trim();


    /* -------------------------------------------------------
       CONTEXTUAL COMPLAINT QUESTIONS
    ------------------------------------------------------- */

    if (
      this.currentComplaint
    ) {

      const handled =
        this.handleContextualQuestion(
          lowerText
        );


      if (handled) {

        return;

      }

    }


    /* -------------------------------------------------------
       INTENT DETECTION
    ------------------------------------------------------- */

    const intent =
      this.detectIntent(
        lowerText
      );


    this.lastIntent =
      intent;


    console.log(
      'CityFix Intent:',
      intent
    );


    this.handleIntent(

      intent,

      text

    );

  }


  /* =======================================================
     QUICK QUESTION
  ======================================================= */

  useQuickQuestion(
    question: string
  ): void {

    this.userMessage =
      question;

    this.sendMessage();

  }


  /* =======================================================
     ALTERNATE QUICK QUESTION
  ======================================================= */

  askQuestion(
    question: string
  ): void {

    this.useQuickQuestion(
      question
    );

  }


  /* =======================================================
     INTENT DETECTION
========================================================= */

  private detectIntent(
    text: string
  ): ChatIntent {


    /* =====================================================
       CITYFIX INFORMATION
       
       IMPORTANT:
       These questions are handled directly.
       They are NOT sent to OpenAI.
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'what is cityfix',

          "what's cityfix",

          'whats cityfix',

          'what does cityfix do',

          'what can cityfix do',

          'how does cityfix work',

          'how cityfix works',

          'how do cityfix work',

          'what is cityfix ai',

          "what's cityfix ai",

          'whats cityfix ai',

          'what does cityfix ai do',

          'what does the cityfix ai do',

          'what is this website',

          'what is this platform',

          'what is this app',

          'tell me about cityfix',

          'explain cityfix'

        ]

      )

    ) {

      return 'cityfix-info';

    }


    /* =====================================================
       GREETING
    ===================================================== */

    if (

      this.matches(

        text,

        [

          'hi',

          'hello',

          'hey',

          'hii',

          'hiii',

          'helo',

          'good morning',

          'good afternoon',

          'good evening',

          'namaste'

        ]

      )

    ) {

      return 'greeting';

    }


    /* =====================================================
       THANKS
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'thanks',

          'thank you',

          'thank u',

          'thx',

          'ty',

          'appreciate it'

        ]

      )

    ) {

      return 'thanks';

    }


    /* =====================================================
       MY COMPLAINTS
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'my complaints',

          'my complaint',

          'my reports',

          'my report',

          'complaints i made',

          'complaints i submitted',

          'complaints i reported',

          'what have i reported',

          'what did i report',

          'what complaints do i have',

          'show my complaints',

          'show me my complaints',

          'show my reports',

          'my submissions'

        ]

      )

    ) {

      return 'my-complaints';

    }


    /* =====================================================
       UNRESOLVED
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'unresolved',

          'open complaints',

          'open complaint',

          'pending complaints',

          'pending complaint',

          'not resolved',

          'not fixed',

          'still open',

          'still pending',

          'complaints not resolved'

        ]

      )

    ) {

      return 'unresolved';

    }


    /* =====================================================
       TRACK
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'track complaint',

          'track my complaint',

          'tracking',

          'track',

          'where is my complaint',

          'where is my report',

          'check my complaint',

          'check complaint',

          'check my report',

          'complaint status',

          'status of my complaint',

          'what is happening with my complaint',

          'whats happening with my complaint',

          'what happened to my complaint',

          'is my complaint resolved',

          'is my complaint fixed'

        ]

      )

    ) {

      return 'track';

    }


    /* =====================================================
       PRIORITY
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'priority score',

          'ai score',

          'priority',

          'how important',

          'how urgent',

          'urgent',

          'urgency',

          'why low',

          'why high',

          'why critical',

          'why is it low',

          'why is it high',

          'why is it critical',

          'why is my complaint low',

          'why is my complaint high'

        ]

      )

    ) {

      return 'priority';

    }


    /* =====================================================
       STATUS
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'status',

          'pending',

          'in progress',

          'resolved',

          'fixed',

          'done',

          'completed',

          'finished',

          'has it been fixed',

          'is it done'

        ]

      )

    ) {

      return 'status';

    }


    /* =====================================================
       CATEGORY
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'what can i report',

          'what can i complain about',

          'what issues can i report',

          'what issues can i complain',

          'what type of complaint',

          'what types of complaints',

          'what types of issues',

          'categories',

          'category',

          'types of issues',

          'what issues',

          'which issues can i report'

        ]

      )

    ) {

      return 'category';

    }


    /* =====================================================
       PHOTO
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'photo',

          'photos',

          'picture',

          'pictures',

          'image',

          'images',

          'attach photo',

          'attach image',

          'upload photo',

          'upload image',

          'proof'

        ]

      )

    ) {

      return 'photo';

    }


    /* =====================================================
       LOCATION
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'location',

          'address',

          'where should i report',

          'where do i report',

          'where to report',

          'enter location',

          'complaint location'

        ]

      )

    ) {

      return 'location';

    }


    /* =====================================================
       LOGIN
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'how to log in',

          'how do i log in',

          'how can i log in',

          'how to login',

          'how do i login',

          'how can i login',

          'login',

          'log in',

          'logging in',

          'sign in',

          'signin',

          'how to sign in',

          'how do i sign in',

          'how can i sign in'

        ]

      )

    ) {

      return 'login';

    }


    /* =====================================================
       REGISTER
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'register',

          'registration',

          'sign up',

          'signup',

          'create account',

          'new account',

          'make an account',

          'how to register'

        ]

      )

    ) {

      return 'register';

    }


    /* =====================================================
       HELP
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'help',

          'help me',

          'what can you do',

          'what do you do',

          'how can you help',

          'what are your features'

        ]

      )

    ) {

      return 'help';

    }


    /* =====================================================
       REPORT
    ===================================================== */

    if (

      this.containsAny(

        text,

        [

          'report',

          'complaint',

          'complain',

          'report an issue',

          'report issue',

          'report a problem',

          'submit complaint',

          'submit an issue',

          'raise complaint',

          'raise an issue',

          'want to report',

          'need to report',

          'i want to complain',

          'i need to complain',

          'civic issue',

          'pothole',

          'garbage',

          'trash',

          'waste',

          'streetlight',

          'street light',

          'water leak',

          'water leakage',

          'water supply',

          'drain',

          'drainage',

          'electricity',

          'power cut',

          'power outage',

          'road damage',

          'broken road',

          'footpath'

        ]

      )

    ) {

      return 'report';

    }


    /* =====================================================
       UNKNOWN
    ===================================================== */

    return 'unknown';

  }


  /* =========================================================
     HANDLE INTENT
  ========================================================= */

  private handleIntent(

    intent: ChatIntent,

    originalText: string

  ): void {


    switch (intent) {


      /* =====================================================
         CITYFIX INFORMATION
      ===================================================== */

      case 'cityfix-info':

        this.handleCityFixInformation(
          originalText
        );

        break;


      /* =====================================================
         GREETING
      ===================================================== */

      case 'greeting':

        this.addBotMessage(

          'Hey! 👋 Welcome to CityFix. I can help you report civic issues, track complaints, check your complaints, or understand how the AI prioritizes reports.'

        );

        break;


      /* =====================================================
         REPORT
      ===================================================== */

      case 'report':

        this.handleReportRequest(
          originalText
        );

        break;


      /* =====================================================
         TRACK
      ===================================================== */

      case 'track':

        this.askForComplaintId();

        break;


      /* =====================================================
         MY COMPLAINTS
      ===================================================== */

      case 'my-complaints':

        this.loadMyComplaints();

        break;


      /* =====================================================
         UNRESOLVED
      ===================================================== */

      case 'unresolved':

        this.loadUnresolvedComplaints();

        break;


      /* =====================================================
         STATUS
      ===================================================== */

      case 'status':

        if (
          this.currentComplaint
        ) {

          this.addBotMessage(

            `The current complaint is currently **${this.currentComplaint.status || 'Pending'}**.`

          );

        } else {

          this.askForComplaintId();

        }

        break;


      /* =====================================================
         PRIORITY
      ===================================================== */

      case 'priority':

        if (
          this.currentComplaint
        ) {

          const score =

            this.currentComplaint.aiScore ??

            this.currentComplaint.priorityScore ??

            0;


          const priority =

            this.currentComplaint.priorityLevel ??

            this.getPriorityFromScore(
              score
            );


          this.addBotMessage(

            `The AI has assigned this complaint a **${priority}** priority with a score of **${score}/100**. Ask me "why is it low?" or "why is it high?" if you want to understand the reasoning.`

          );

        } else {

          this.askForComplaintId();

        }

        break;


      /* =====================================================
         CATEGORY
      ===================================================== */

      case 'category':

        this.addBotMessage(

          'CityFix currently supports these complaint categories: 🚧 Road, 🗑️ Garbage, 💧 Water, ⚡ Electricity, 💡 Streetlight, 🚰 Drainage, and Other civic issues.'

        );

        break;


      /* =====================================================
         PHOTO
      ===================================================== */

      case 'photo':

        this.addBotMessage(

          'Yes 📸 You can attach a JPG, JPEG, PNG, or WEBP photo while submitting a complaint. The photo can provide useful evidence about the issue.'

        );

        break;


      /* =====================================================
         LOCATION
      ===================================================== */

      case 'location':

        this.addBotMessage(

          'When reporting an issue, provide the location or address where the problem is happening. A more specific location helps the complaint reach the correct area.'

        );

        break;


      /* =====================================================
         LOGIN
      ===================================================== */

      case 'login':

        this.addBotMessage(

          'To log in to CityFix, open **Citizen Login**, enter your registered email address and password, and click **Login**.'

        );

        break;


      /* =====================================================
         REGISTER
      ===================================================== */

      case 'register':

        this.addBotMessage(

          'To create a CityFix account, open **Citizen Registration**, enter your details and password, then submit the registration form.'

        );

        break;


      /* =====================================================
         HELP
      ===================================================== */

      case 'help':

        this.addBotMessage(

          'I can help with several things 😊\n\n• Report a civic issue\n• Track a complaint\n• View your complaints\n• Check unresolved complaints\n• Understand AI priority\n• Check complaint status\n• Learn supported categories\n• Understand photo and location requirements\n• Login and registration\n• Learn about CityFix and how it works'

        );

        break;


      /* =====================================================
         THANKS
      ===================================================== */

      case 'thanks':

        this.addBotMessage(

          'You’re welcome! 💜 I’m here whenever you need help with CityFix.'

        );

        break;


      /* =====================================================
         UNKNOWN → AI
      ===================================================== */

      default:

        this.sendToAI(
          originalText
        );

        break;

    }

  }


  /* =========================================================
     CITYFIX INFORMATION
  ========================================================= */

  private handleCityFixInformation(
    text: string
  ): void {

    const lowerText =
      text
        .toLowerCase()
        .trim();


    /* =====================================================
       WHAT IS CITYFIX
    ===================================================== */

    if (

      lowerText.includes(
        'what is cityfix'
      ) ||

      lowerText ===
        "what's cityfix" ||

      lowerText ===
        'whats cityfix' ||

      lowerText.includes(
        'tell me about cityfix'
      ) ||

      lowerText.includes(
        'explain cityfix'
      )

    ) {

      this.addBotMessage(

        'CityFix is an **AI-based citizen complaint prioritization platform** 🏙️. It allows citizens to report civic problems such as road damage, garbage, water issues, electricity problems, streetlights and drainage. CityFix uses AI to analyze complaints and help prioritize them based on their urgency and impact.'

      );

      return;

    }


    /* =====================================================
       HOW CITYFIX WORKS
    ===================================================== */

    if (

      lowerText.includes(
        'how does cityfix work'
      ) ||

      lowerText.includes(
        'how cityfix works'
      ) ||

      lowerText.includes(
        'how do cityfix work'
      )

    ) {

      this.addBotMessage(

        'CityFix works through a simple process:\n\n' +

        '1. 📝 A citizen reports a civic issue.\n\n' +

        '2. 📍 The complaint details, category, severity and location are stored.\n\n' +

        '3. 🤖 CityFix AI analyzes the complaint.\n\n' +

        '4. 📊 The system generates an AI score and priority level.\n\n' +

        '5. 🧠 AI provides reasons, detected factors, recommended action and an estimated resolution time.\n\n' +

        '6. 👨‍💼 Administrators can manage and update the complaint.\n\n' +

        '7. 🔎 Citizens can track their complaint and check its status.'

      );

      return;

    }


    /* =====================================================
       WHAT DOES CITYFIX DO
    ===================================================== */

    if (

      lowerText.includes(
        'what does cityfix do'
      ) ||

      lowerText.includes(
        'what can cityfix do'
      )

    ) {

      this.addBotMessage(

        'CityFix helps citizens report and track civic problems while using AI to analyze and prioritize complaints. You can report issues, upload evidence, provide a location, track complaints, view their status and understand why a complaint received a particular priority.'

      );

      return;

    }


    /* =====================================================
       CITYFIX AI
    ===================================================== */

    if (

      lowerText.includes(
        'what is cityfix ai'
      ) ||

      lowerText.includes(
        'what does cityfix ai do'
      ) ||

      lowerText.includes(
        'what does the cityfix ai do'
      )

    ) {

      this.addBotMessage(

        'CityFix AI analyzes citizen complaints and helps determine their urgency. It can generate an **AI score, priority level, reasons, detected factors, recommended action and predicted resolution time**. This helps administrators understand which complaints may require greater attention.'

      );

      return;

    }


    /* =====================================================
       CITYFIX FEATURES
    ===================================================== */

    if (

      lowerText.includes(
        'cityfix features'
      ) ||

      lowerText.includes(
        'features of cityfix'
      ) ||

      lowerText.includes(
        'what features does cityfix have'
      )

    ) {

      this.addBotMessage(

        'CityFix includes:\n\n' +

        '• 📝 Civic complaint reporting\n' +

        '• 📸 Photo evidence\n' +

        '• 📍 Location information\n' +

        '• 🤖 AI complaint prioritization\n' +

        '• 📊 AI score and reasons\n' +

        '• 🔎 Complaint tracking\n' +

        '• 📋 My Complaints\n' +

        '• 👨‍💼 Admin complaint management\n' +

        '• 📈 Analytics and AI analysis\n' +

        '• 💬 CityFix AI chatbot'

      );

      return;

    }


    /* =====================================================
       FALLBACK
    ===================================================== */

    this.addBotMessage(

      'CityFix is an AI-based citizen complaint prioritization platform that helps citizens report civic issues and track their complaints. I can also explain how CityFix works or what CityFix AI does.'

    );

  }


  /* =========================================================
     AI CHATBOT
  ========================================================= */

  private sendToAI(
    message: string
  ): void {

    this.isTyping = true;


    /* -------------------------------------------------------
       CONVERSATION HISTORY
    ------------------------------------------------------- */

    const history =

      this.messages

        .slice(-10)

        .map(chat => ({

          sender:
            chat.sender,

          text:
            chat.text

        }));


    /* -------------------------------------------------------
       COMPLAINT CONTEXT
    ------------------------------------------------------- */

    let complaintContext:
      any = null;


    if (
      this.currentComplaint
    ) {

      const score =

        this.currentComplaint.aiScore ??

        this.currentComplaint.priorityScore ??

        0;


      const priority =

        this.currentComplaint.priorityLevel ??

        this.getPriorityFromScore(
          score
        );


      complaintContext = {

        id:
          this.currentComplaint._id,

        title:
          this.currentComplaint.title ||
          'Untitled complaint',

        status:
          this.currentComplaint.status ||
          'Pending',

        category:
          this.currentComplaint.category ||
          'Other',

        priority:
          priority,

        score:
          score,

        location:
          this.currentComplaint
            .location?.address ||
          'Location not available',

        date:
          this.currentComplaint.createdAt

            ? this.formatDate(
                this.currentComplaint.createdAt
              )

            : 'Date not available',

        resolution:
          this.currentComplaint
            .predictedResolutionTime ??
          null,

        aiReasons:
          this.currentComplaint
            .aiReasons ||
          [],

        detectedFactors:
          this.currentComplaint
            .detectedFactors ||
          [],

        recommendedAction:
          this.currentComplaint
            .recommendedAction ||
          ''

      };

    }


    /* -------------------------------------------------------
       SEND TO BACKEND
    ------------------------------------------------------- */

    this.http.post<any>(

      this.chatApiUrl,

      {

        message:
          message,

        history:
          history,

        complaintContext:
          complaintContext

      }

    ).subscribe({

      next: (response) => {

        this.isTyping = false;


        const reply =

          response?.reply ||

          response?.message ||

          response?.response;


        if (reply) {

          this.addBotMessage(
            reply
          );

        } else {

          this.addBotMessage(

            'Sorry, I could not generate a response right now. Please try again.'

          );

        }

      },


      error: (error) => {

        this.isTyping = false;


        console.error(
          'AI CHAT ERROR:',
          error
        );


        if (
          error.status === 0
        ) {

          this.addBotMessage(

            'I cannot connect to the CityFix AI server right now. Please make sure your backend is running on port 5000.'

          );

          return;

        }


        if (

          error.status === 401 ||

          error.status === 403

        ) {

          this.addBotMessage(

            'The AI service rejected the request. Please check your OpenAI API configuration.'

          );

          return;

        }


        this.addBotMessage(

          'I’m having trouble connecting to the AI assistant right now. Please try again in a moment.'

        );

      }

    });

  }


  /* =========================================================
     REPORT REQUEST
  ========================================================= */

  private handleReportRequest(
    text: string
  ): void {

    const category =
      this.detectComplaintCategory(
        text.toLowerCase()
      );


    if (category) {

      this.addBotMessage(

        `That sounds like a **${category}** issue. 🏙️\n\nYou can report it through the **Report Issue** page. Add a clear title, describe what happened, provide the exact location, select the severity, and optionally attach a photo.`

      );

      return;

    }


    this.addBotMessage(

      'You can report a civic issue through the **Report Issue** page. 🏙️\n\nAdd the issue title, describe the problem, select its category and severity, provide the location, and optionally attach a photo.'

    );

  }


  /* =========================================================
     CATEGORY DETECTOR
  ========================================================= */

  private detectComplaintCategory(
    text: string
  ): string | null {


    if (

      this.containsAny(

        text,

        [

          'pothole',

          'road',

          'road damage',

          'broken road',

          'footpath',

          'pavement',

          'street damage',

          'traffic'

        ]

      )

    ) {

      return 'Road';

    }


    if (

      this.containsAny(

        text,

        [

          'garbage',

          'trash',

          'waste',

          'litter',

          'dump'

        ]

      )

    ) {

      return 'Garbage';

    }


    if (

      this.containsAny(

        text,

        [

          'water leak',

          'water leakage',

          'water supply',

          'pipeline',

          'no water'

        ]

      )

    ) {

      return 'Water';

    }


    if (

      this.containsAny(

        text,

        [

          'electricity',

          'electric',

          'power cut',

          'power outage',

          'no power'

        ]

      )

    ) {

      return 'Electricity';

    }


    if (

      this.containsAny(

        text,

        [

          'streetlight',

          'street light',

          'street lamp',

          'lamp post'

        ]

      )

    ) {

      return 'Streetlight';

    }


    if (

      this.containsAny(

        text,

        [

          'drain',

          'drainage',

          'sewer',

          'sewage',

          'blocked drain',

          'flooding'

        ]

      )

    ) {

      return 'Drainage';

    }


    return null;

  }


  /* =========================================================
     CONTEXTUAL QUESTIONS
  ========================================================= */

  private handleContextualQuestion(
    text: string
  ): boolean {


    if (
      !this.currentComplaint
    ) {

      return false;

    }


    /* -------------------------------------------------------
       PRIORITY
    ------------------------------------------------------- */

    if (

      this.containsAny(

        text,

        [

          'why is it low',

          'why is it high',

          'why is it critical',

          'why low',

          'why high',

          'why critical',

          'why this priority',

          'why this score',

          'how important',

          'how urgent',

          'why urgent',

          'ai score',

          'priority score'

        ]

      )

    ) {

      const score =

        this.currentComplaint.aiScore ??

        this.currentComplaint.priorityScore ??

        0;


      const priority =

        this.currentComplaint.priorityLevel ??

        this.getPriorityFromScore(
          score
        );


      const reasons =

        this.currentComplaint
          .aiReasons || [];


      if (
        reasons.length > 0
      ) {

        this.addBotMessage(

          `For this complaint, the AI assigned a **${priority}** priority with a score of **${score}/100**.\n\n**Why:**\n• ${reasons.join('\n• ')}\n\nThe score is an automated assessment and is not a guarantee of the actual resolution time.`

        );

      } else {

        this.addBotMessage(

          `For this complaint, the AI priority is **${priority}** with a score of **${score}/100**. The score can consider factors such as severity, category, location impact, evidence, and similar complaints.`

        );

      }


      return true;

    }


    /* -------------------------------------------------------
       STATUS
    ------------------------------------------------------- */

    if (

      this.containsAny(

        text,

        [

          'what is the status',

          "what's the status",

          'whats the status',

          'status',

          'is it resolved',

          'is it fixed',

          'is it done',

          'has it been fixed',

          'what happened',

          'what happened to it',

          'is this resolved'

        ]

      )

    ) {

      this.addBotMessage(

        `The current status is **${this.currentComplaint.status || 'Pending'}**.`

      );


      return true;

    }


    /* -------------------------------------------------------
       CATEGORY
    ------------------------------------------------------- */

    if (

      this.containsAny(

        text,

        [

          'what category',

          'which category',

          'what type',

          'which type',

          'category of this',

          'type of this'

        ]

      )

    ) {

      this.addBotMessage(

        `This complaint belongs to the **${this.currentComplaint.category || 'Other'}** category.`

      );


      return true;

    }


    /* -------------------------------------------------------
       LOCATION
    ------------------------------------------------------- */

    if (

      this.containsAny(

        text,

        [

          'where is it',

          'where was it reported',

          'where was this reported',

          'what location',

          'which location',

          'what address',

          'where exactly'

        ]

      )

    ) {

      this.addBotMessage(

        `The complaint was reported at **${this.currentComplaint.location?.address || 'the location provided in the complaint'}**.`

      );


      return true;

    }


    /* -------------------------------------------------------
       RESOLUTION
    ------------------------------------------------------- */

    if (

      this.containsAny(

        text,

        [

          'how long',

          'when will it be resolved',

          'when will it be fixed',

          'when will this be fixed',

          'estimated time',

          'resolution time',

          'how much time',

          'when will this finish'

        ]

      )

    ) {

      const days =

        this.currentComplaint
          .predictedResolutionTime;


      if (

        days !== undefined &&

        days !== null

      ) {

        this.addBotMessage(

          `The estimated resolution time for this complaint is approximately **${days} day${days === 1 ? '' : 's'}**. This is an AI prediction, so the actual time may vary.`

        );

      } else {

        this.addBotMessage(

          'There is currently no estimated resolution time available for this complaint.'

        );

      }


      return true;

    }


    /* -------------------------------------------------------
       MORE DETAILS
    ------------------------------------------------------- */

    if (

      this.containsAny(

        text,

        [

          'tell me more',

          'more details',

          'show details',

          'give me details',

          'explain this',

          'explain more',

          'more information'

        ]

      )

    ) {

      this.trackComplaint(

        this.currentComplaint._id

      );


      return true;

    }


    return false;

  }


  /* =========================================================
     ASK COMPLAINT ID
  ========================================================= */

  private askForComplaintId(): void {

    this.waitingForComplaintId =
      true;


    this.addBotMessage(

      'Sure! 🔎 Please enter your **Complaint ID**, and I’ll check its current status and AI analysis.'

    );

  }


  /* =========================================================
     TRACK COMPLAINT
  ========================================================= */

  trackComplaint(
    complaintId: string
  ): void {

    const id =
      complaintId.trim();


    if (!id) {

      this.addBotMessage(

        'Please enter a valid Complaint ID.'

      );

      return;

    }


    this.isTyping = true;


    this.http

      .get<any>(

        `${this.apiUrl}/${encodeURIComponent(id)}`

      )

      .subscribe({

        next: (response) => {

          this.isTyping = false;


          const complaint =

            response?.complaint ||

            response;


          if (!complaint) {

            this.addBotMessage(

              'I couldn’t find a complaint with that ID. Please check the ID and try again.'

            );

            return;

          }


          this.currentComplaint =
            complaint;


          this.showComplaintDetails(
            complaint
          );

        },


        error: (error) => {

          this.isTyping = false;


          console.error(

            'TRACK COMPLAINT ERROR:',
            error

          );


          if (
            error.status === 404
          ) {

            this.addBotMessage(

              'I couldn’t find a complaint with that ID. Please check the Complaint ID and try again.'

            );

          } else {

            this.addBotMessage(

              'I’m unable to connect to the CityFix complaint service right now. Please make sure the backend server is running.'

            );

          }

        }

      });

  }


  /* =========================================================
     SHOW COMPLAINT DETAILS
  ========================================================= */

  private showComplaintDetails(
    complaint: any
  ): void {

    const complaintData:
      ComplaintData = {

      id:
        complaint._id,

      title:
        complaint.title ||
        'Untitled Complaint',

      status:
        complaint.status ||
        'Pending',

      priority:
        complaint.aiLevel ||
        complaint.priorityLevel ||
        this.getPriorityFromScore(

          complaint.aiScore ??

          complaint.priorityScore ??

          0

        ),

      score:
        complaint.aiScore ??
        complaint.priorityScore ??
        0,

      category:
        complaint.category ||
        'Other',

      location:
        complaint.location?.address ||
        'Location not provided',

      date:
        complaint.createdAt

          ? this.formatDate(
              complaint.createdAt
            )

          : 'Date unavailable',

      resolution:
        complaint.predictedResolutionTime ??
        null,

      aiReasons:
        complaint.aiReasons ||
        [],

      detectedFactors:
        complaint.detectedFactors ||
        [],

      recommendedAction:
        complaint.recommendedAction ||
        ''

    };


    this.messages.push({

      sender: 'bot',

      text:
        'Here’s what I found for your complaint:',

      time:
        this.getCurrentTime(),

      complaintData

    });

  }


  /* =========================================================
     LOAD MY COMPLAINTS
  ========================================================= */

  private loadMyComplaints(): void {

    const email =
      this.getCitizenEmail();


    if (!email) {

      this.addBotMessage(

        'To view your complaints, please log in to your CityFix citizen account first.'

      );

      return;

    }


    this.isTyping = true;


    this.addBotMessage(

      '📋 Checking your CityFix complaints...'

    );


    this.http

      .get<any>(

        `${this.apiUrl}/citizen/${encodeURIComponent(email)}`

      )

      .subscribe({

        next: (response) => {

          this.isTyping = false;


          const complaints:
            CitizenComplaint[] =

            Array.isArray(response)

              ? response

              : response?.complaints || [];


          this.citizenComplaints =
            complaints;


          if (
            complaints.length === 0
          ) {

            this.addBotMessage(

              'You haven’t submitted any complaints yet. When you report an issue through CityFix, it will appear here.'

            );

            return;

          }


          this.currentComplaint =
            complaints[0];


          this.messages.push({

            sender: 'bot',

            text:
              'Here are the complaints associated with your CityFix account:',

            time:
              this.getCurrentTime(),

            citizenComplaints:
              complaints

          });

        },


        error: (error) => {

          this.isTyping = false;


          console.error(

            'MY COMPLAINTS ERROR:',

            error

          );


          this.addBotMessage(

            'I couldn’t load your complaints right now. Please make sure you are logged in and the CityFix backend is running.'

          );

        }

      });

  }


  /* =========================================================
     LOAD UNRESOLVED COMPLAINTS
  ========================================================= */

  private loadUnresolvedComplaints(): void {

    const email =
      this.getCitizenEmail();


    if (!email) {

      this.addBotMessage(

        'Please log in to your CityFix account first so I can check your unresolved complaints.'

      );

      return;

    }


    this.isTyping = true;


    this.http

      .get<any>(

        `${this.apiUrl}/citizen/${encodeURIComponent(email)}`

      )

      .subscribe({

        next: (response) => {

          this.isTyping = false;


          const complaints:
            CitizenComplaint[] =

            Array.isArray(response)

              ? response

              : response?.complaints || [];


          const unresolved =

            complaints.filter(

              complaint =>

                complaint.status !==
                'Resolved'

            );


          if (
            unresolved.length === 0
          ) {

            this.addBotMessage(

              'Good news! 🎉 You currently have no unresolved complaints.'

            );

            return;

          }


          this.currentComplaint =
            unresolved[0];


          this.messages.push({

            sender: 'bot',

            text:

              `You currently have **${unresolved.length} unresolved complaint${unresolved.length === 1 ? '' : 's'}**:`,

            time:
              this.getCurrentTime(),

            citizenComplaints:
              unresolved

          });

        },


        error: (error) => {

          this.isTyping = false;


          console.error(

            'UNRESOLVED COMPLAINTS ERROR:',

            error

          );


          this.addBotMessage(

            'I couldn’t check your unresolved complaints right now. Please try again.'

          );

        }

      });

  }


  /* =========================================================
     GET CITIZEN EMAIL
  ========================================================= */

  private getCitizenEmail():
    string | null {

    const directEmail =

      localStorage.getItem(
        'citizenEmail'
      );


    if (

      directEmail &&

      directEmail.trim()

    ) {

      return directEmail

        .trim()

        .toLowerCase();

    }


    const citizenData =

      localStorage.getItem(
        'cityfixCitizen'
      ) ||

      localStorage.getItem(
        'citizen'
      );


    if (citizenData) {

      try {

        const citizen =

          JSON.parse(
            citizenData
          );


        if (
          citizen?.email
        ) {

          return citizen.email

            .trim()

            .toLowerCase();

        }

      } catch {

        console.warn(
          'Invalid citizen data.'
        );

      }

    }


    return null;

  }


  /* =========================================================
     PRIORITY CALCULATION
  ========================================================= */

  calculatePriority(
    score: number
  ): string {

    const numericScore =
      Number(score) || 0;


    if (
      numericScore >= 80
    ) {

      return 'Critical';

    }


    if (
      numericScore >= 60
    ) {

      return 'High';

    }


    if (
      numericScore >= 40
    ) {

      return 'Medium';

    }


    return 'Low';

  }


  /* =========================================================
     GET PRIORITY FROM SCORE
  ========================================================= */

  private getPriorityFromScore(
    score: number
  ): string {

    return this.calculatePriority(
      score
    );

  }


  /* =========================================================
     PRIORITY CSS CLASS
  ========================================================= */

  getPriorityClass(
    priority: string
  ): string {

    const value =

      (priority || '')

        .toLowerCase()

        .trim();


    switch (value) {

      case 'critical':

        return 'priority-critical';


      case 'high':

        return 'priority-high';


      case 'medium':

        return 'priority-medium';


      case 'low':

        return 'priority-low';


      default:

        return 'priority-low';

    }

  }


  /* =========================================================
     SCORE CSS CLASS
  ========================================================= */

  getScoreClass(
    score: number
  ): string {

    const numericScore =
      Number(score) || 0;


    if (
      numericScore >= 80
    ) {

      return 'score-critical';

    }


    if (
      numericScore >= 60
    ) {

      return 'score-high';

    }


    if (
      numericScore >= 40
    ) {

      return 'score-medium';

    }


    return 'score-low';

  }


  /* =========================================================
     STATUS CSS CLASS
  ========================================================= */

  getStatusClass(
    status: string
  ): string {

    const value =

      (status || '')

        .toLowerCase()

        .trim();


    switch (value) {

      case 'resolved':

        return 'status-resolved';


      case 'in progress':

        return 'status-progress';


      case 'pending':

        return 'status-pending';


      default:

        return 'status-pending';

    }

  }


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  formatDate(
    date: string | undefined
  ): string {

    if (!date) {

      return 'Date unavailable';

    }


    const parsed =
      new Date(date);


    if (

      Number.isNaN(
        parsed.getTime()
      )

    ) {

      return 'Date unavailable';

    }


    return parsed.toLocaleDateString(

      'en-IN',

      {

        day: '2-digit',

        month: 'short',

        year: 'numeric'

      }

    );

  }


  /* =========================================================
     SMART FALLBACK
  ========================================================= */

  private getSmartFallback(
    text: string
  ): string {


    if (
      text.includes('pothole')
    ) {

      return (

        'A pothole can be reported as a **Road** issue. 🚧\n\n' +

        'Open Report Issue, describe the pothole, provide the location, select the severity, and optionally attach a photo.'

      );

    }


    if (

      text.includes('garbage') ||

      text.includes('trash')

    ) {

      return (

        'Garbage or waste accumulation can be reported as a **Garbage** complaint. 🗑️\n\n' +

        'Include the location and, if possible, attach a photo.'

      );

    }


    if (
      text.includes('water')
    ) {

      return (

        'Water leaks, pipeline problems, or water supply issues can be reported under **Water**. 💧'

      );

    }


    if (

      text.includes('electric') ||

      text.includes('power')

    ) {

      return (

        'Electricity and power-related civic issues can be reported under **Electricity**. ⚡'

      );

    }


    return (

      'I’m not completely sure what you mean yet. 🤔\n\n' +

      'You can ask me things like:\n\n' +

      '• “How do I report a pothole?”\n' +

      '• “Show my complaints”\n' +

      '• “Track my complaint”\n' +

      '• “Why is my complaint high priority?”\n' +

      '• “What is the status?”\n' +

      '• “What can I report?”'

    );

  }


  /* =========================================================
     TEXT HELPERS
  ========================================================= */

  private containsAny(

    text: string,

    phrases: string[]

  ): boolean {

    return phrases.some(

      phrase =>

        text.includes(
          phrase.toLowerCase()
        )

    );

  }


  private matches(

    text: string,

    phrases: string[]

  ): boolean {

    return phrases.some(

      phrase =>

        text ===
        phrase.toLowerCase()

    );

  }


  /* =========================================================
     ADD BOT MESSAGE
  ========================================================= */

  private addBotMessage(
    text: string
  ): void {

    this.messages.push({

      sender: 'bot',

      text: text,

      time:
        this.getCurrentTime()

    });

  }


  /* =========================================================
     NAVIGATION
  ========================================================= */

  navigateTo(
    route: string
  ): void {

    this.router.navigate([

      route

    ]);


    this.isOpen = false;

  }


  /* =========================================================
     REPORT ISSUE
  ========================================================= */

  goToReportIssue(): void {

    this.router.navigate([

      '/report-issue'

    ]);


    this.isOpen = false;

  }


  /* =========================================================
     TRACK COMPLAINT
  ========================================================= */

  goToTrackComplaint(): void {

    this.router.navigate([

      '/track-complaint'

    ]);


    this.isOpen = false;

  }


  /* =========================================================
     MY COMPLAINTS
  ========================================================= */

  goToMyComplaints(): void {

    this.router.navigate([

      '/my-complaints'

    ]);


    this.isOpen = false;

  }


  /* =========================================================
     CLEAR CHAT
  ========================================================= */

  clearChat(): void {

    this.messages = [

      {

        sender: 'bot',

        text:
          'Hi! I’m CityFix AI 👋 I can help you report civic issues, track complaints, understand complaint status, view your complaints, and navigate the CityFix platform.',

        time:
          this.getCurrentTime()

      }

    ];


    this.currentComplaint =
      null;


    this.citizenComplaints =
      [];


    this.waitingForComplaintId =
      false;


    this.lastIntent =
      '';

  }


  /* =========================================================
     CURRENT TIME
  ========================================================= */

  private getCurrentTime():
    string {

    return new Date()

      .toLocaleTimeString(

        'en-IN',

        {

          hour: '2-digit',

          minute: '2-digit'

        }

      );

  }

}