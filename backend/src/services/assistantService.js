import { ChatGroq } from '@langchain/groq';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile',
  temperature: 0.3,
  maxTokens: 800,
});

// === LangGraph State ===
const GraphState = Annotation.Root({
  messages: Annotation({ reducer: (a, b) => [...a, ...b], default: () => [] }),
  userMessage: Annotation({ reducer: (_, b) => b, default: () => '' }),
  intent: Annotation({ reducer: (_, b) => b, default: () => 'help' }),
  filterUpdates: Annotation({ reducer: (_, b) => b, default: () => null }),
  searchQuery: Annotation({ reducer: (_, b) => b, default: () => null }),
  response: Annotation({ reducer: (_, b) => b, default: () => '' }),
});

// === Node 1: Intent Detection ===
async function detectIntent(state) {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', `You are an intent classifier for a job tracker app.
Classify the user message into ONE of these intents:
- "filter": user wants to update/change filters (remote, job type, date, skills filter, clear filters)
- "search": user wants to find/show specific jobs
- "help": user asking how to use the app
- "general": casual conversation

Return ONLY valid JSON: {{"intent": "<intent>", "confidence": <0-1>}}`],
    ['human', '{message}'],
  ]);

  try {
    const result = await model.invoke(await prompt.formatMessages({ message: state.userMessage }));
    const parsed = JSON.parse(result.content.replace(/```json|```/g, '').trim());
    return { intent: parsed.intent || 'help' };
  } catch {
    return { intent: 'search' };
  }
}

// === Node 2a: Build Filter Updates ===
async function buildFilterUpdates(state) {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', `Extract filter update commands from the user message for a job board.
Available filters: workMode (remote/hybrid/on-site/all), jobType (full-time/part-time/contract/internship/all), datePosted (24h/week/month/any), matchScore (high/medium/all), location (string), skills (array), title (string).

Return ONLY valid JSON with only the fields that should change:
{{"filterUpdates": {{<only changed fields>}}, "clearAll": <true/false>, "response": "<friendly confirmation message>"}}`],
    ['human', '{message}'],
  ]);

  try {
    const result = await model.invoke(await prompt.formatMessages({ message: state.userMessage }));
    const parsed = JSON.parse(result.content.replace(/```json|```/g, '').trim());
    return {
      filterUpdates: parsed.clearAll ? { clear: true } : (parsed.filterUpdates || {}),
      response: parsed.response || "I've updated the filters for you!",
    };
  } catch {
    return {
      filterUpdates: {},
      response: "I tried to update the filters but had trouble. Please try again.",
    };
  }
}

// === Node 2b: Build Search Query ===
async function buildSearchQuery(state) {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', `Extract job search parameters from the user message.
Return ONLY valid JSON:
{{"title": "<job title or null>", "skills": [<skills array>], "workMode": "<remote/hybrid/on-site/all or null>", "jobType": "<full-time/part-time/contract/internship/all or null>", "location": "<location or null>", "datePosted": "<24h/week/month/any or null>", "response": "<brief friendly message about what you're showing>"}}`],
    ['human', '{message}'],
  ]);

  try {
    const result = await model.invoke(await prompt.formatMessages({ message: state.userMessage }));
    const parsed = JSON.parse(result.content.replace(/```json|```/g, '').trim());
    return {
      searchQuery: parsed,
      response: parsed.response || "Here are the jobs I found for you!",
    };
  } catch {
    return {
      searchQuery: null,
      response: "Let me find some relevant jobs for you!",
    };
  }
}

// === Node 2c: Help Response ===
async function provideHelp(state) {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', `You are a helpful assistant for a job tracking application. Answer user questions about using the app.

App features:
- Job feed with smart filters (role, skills, date, type, work mode, location, match score)
- Resume upload: click your avatar/profile to upload PDF or TXT resume
- AI job matching: each job card shows a match score (0-100%) based on your resume
- Best Matches section: top 6-8 highest scoring jobs shown at the top
- Apply tracking: when you click Apply and return, a popup asks if you applied
- Application dashboard: track all applications with status (Applied/Interview/Offer/Rejected)
- AI assistant: that's me! I can search jobs, update filters, and answer questions

Be concise, friendly, and helpful. 2-3 sentences max.`],
    ['human', '{message}'],
  ]);

  try {
    const result = await model.invoke(await prompt.formatMessages({ message: state.userMessage }));
    return { response: result.content };
  } catch {
    return { response: "I'm here to help! You can ask me to find jobs, update filters, or learn about app features." };
  }
}

// === Node 3: Route to correct node ===
function routeByIntent(state) {
  const intent = state.intent;
  if (intent === 'filter') return 'buildFilterUpdates';
  if (intent === 'search') return 'buildSearchQuery';
  return 'provideHelp';
}

// === Build the LangGraph ===
function buildAssistantGraph() {
  const graph = new StateGraph(GraphState)
    .addNode('detectIntent', detectIntent)
    .addNode('buildFilterUpdates', buildFilterUpdates)
    .addNode('buildSearchQuery', buildSearchQuery)
    .addNode('provideHelp', provideHelp)
    .addEdge(START, 'detectIntent')
    .addConditionalEdges('detectIntent', routeByIntent, {
      buildFilterUpdates: 'buildFilterUpdates',
      buildSearchQuery: 'buildSearchQuery',
      provideHelp: 'provideHelp',
    })
    .addEdge('buildFilterUpdates', END)
    .addEdge('buildSearchQuery', END)
    .addEdge('provideHelp', END);

  return graph.compile();
}

const assistantGraph = buildAssistantGraph();

// === Main export: run the graph ===
export async function runAssistant(userMessage, conversationHistory = []) {
  const messages = conversationHistory.map(m =>
    m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
  );

  const initialState = {
    userMessage,
    messages: [...messages, new HumanMessage(userMessage)],
    intent: 'help',
    filterUpdates: null,
    searchQuery: null,
    response: '',
  };

  try {
    const result = await assistantGraph.invoke(initialState);

    return {
      response: result.response,
      intent: result.intent,
      filterUpdates: result.filterUpdates,
      searchQuery: result.searchQuery,
    };
  } catch (err) {
    console.error('Assistant error:', err.message);
    return {
      response: "I'm having a moment. Could you try rephrasing that?",
      intent: 'help',
      filterUpdates: null,
      searchQuery: null,
    };
  }
}
