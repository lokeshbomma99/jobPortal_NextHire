const { Conversation, Message } = require("../models/Message");

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "name avatar role companyName lastSeen")
      .populate("lastMessage")
      .populate("job", "title companyName")
      .sort("-lastMessageAt");
    res.json({ success: true, data: conversations });
  } catch (err) {
    console.error("Error in getConversations:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { participantId, jobId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      ...(jobId ? { job: jobId } : {}),
    });
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        job: jobId || undefined,
      });
      console.log("Created new conversation:", conversation._id);
    } else {
      console.log("Found existing conversation:", conversation._id);
    }
    
    await conversation.populate("participants", "name avatar role companyName lastSeen");
    if (jobId) await conversation.populate("job", "title companyName");
    
    res.json({ success: true, data: conversation.toObject() });
  } catch (err) {
    console.error("Error in getOrCreateConversation:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId || conversationId === 'undefined') {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    
    if (!conversation.participants.includes(req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    const messages = await Message.find({ conversation: conversationId, isDeleted: false })
      .populate("sender", "name avatar")
      .sort("createdAt");

    // Mark as read
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("Error in getMessages:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      readBy: [req.user._id],
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    await message.populate("sender", "name avatar");

    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("chat:message", { 
        message: message.toObject(), 
        conversationId 
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
