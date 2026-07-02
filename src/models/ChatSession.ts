import mongoose, { Schema, Document, Model } from "mongoose";

// ── Sub-types ─────────────────────────────────────────────────────────────────

export interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IContext {
  budget?: string; // e.g. "₹50,000–₹80,000"
  groupSize?: number;
  travelStyle?: string; // e.g. "family", "adventure", "luxury"
  interestedPackages?: string[]; // package IDs the user showed interest in
  travelDates?: {
    start?: string;
    end?: string;
  };
  preferredDestinations?: string[];
  lastUpdated?: Date;
}

// ── Document interface ────────────────────────────────────────────────────────

export interface IChatSession extends Document {
  userId?: mongoose.Types.ObjectId; // undefined = guest session
  guestId?: string; // sessionStorage uuid for guests
  source: "bubble" | "planner";
  messages: IMessage[];
  context: IContext;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const ContextSchema = new Schema<IContext>(
  {
    budget: { type: String },
    groupSize: { type: Number },
    travelStyle: { type: String },
    interestedPackages: [{ type: String }],
    travelDates: {
      start: { type: String },
      end: { type: String },
    },
    preferredDestinations: [{ type: String }],
    lastUpdated: { type: Date },
  },
  { _id: false },
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestId: { type: String, index: true },
    source: { type: String, enum: ["bubble", "planner"], required: true },
    messages: { type: [MessageSchema], default: [] },
    context: { type: ContextSchema, default: {} },
  },
  { timestamps: true },
);

// Index for fast lookup of a user's latest session per source
ChatSessionSchema.index({ userId: 1, source: 1, updatedAt: -1 });
ChatSessionSchema.index({ guestId: 1, source: 1, updatedAt: -1 });

// Auto-delete guest sessions after 7 days (logged-in sessions kept forever)
ChatSessionSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 7, // 7 days
    partialFilterExpression: { userId: { $exists: false } },
  },
);

//Model (singleton-safe for Next.js hot reload) ─────────────────────────────

export const ChatSessionModel: Model<IChatSession> =
  mongoose.models.ChatSession ??
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
