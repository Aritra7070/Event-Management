

import { prisma } from "../db/prismadb.js";

const NewEventCreation = async (req, res) => {
  try {
    const {
      organizerid,
      eventname,
      eventDate,
      eventTime,
      Description,
      totalseat,
      Rules,
      location,
      questions,
    } = req.body;
    if (!organizerid){
      return res.status(401).json({
        "msg":"user id not provided "
      })
    }

    // Validate required fields
    if (
     
      !eventname ||
      !eventDate ||
      !eventTime ||
      !Description ||
      totalseat == null ||
      !Rules ||
      !location
    ) {
      return res.status(400).json({
        msg: "All event fields are required",
      });
    }

    if (!Number.isInteger(Number(totalseat)) || Number(totalseat) <= 0) {
      return res.status(400).json({
        msg: "totalseat must be a positive integer, it not an Number ",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        msg: "Provide at least one question , it is Required",
      });
    }

    const parsedEventDate = new Date(eventDate);
    const parsedEventTime = new Date(eventTime);

    if (
      Number.isNaN(parsedEventDate.getTime()) ||
      Number.isNaN(parsedEventTime.getTime())
    ) {
      return res.status(400).json({
        msg: "Invalid eventDate or eventTime",
      });
    }

    // Validate question objects
    const invalidQuestion = questions.some(
      (q) =>
        typeof q.question !== "string" ||
        !q.question.trim() ||
        (q.isrequire != null && typeof q.isrequire !== "boolean")
    );

    if (invalidQuestion) {
      return res.status(400).json({
        msg: "Each question needs a question string and a boolean isrequire value",
      });
    }

   
    const newEvent = await prisma.eventRegistration.create({
      data: {
        organizerid,
        eventname,
        eventDate: parsedEventDate,
        eventTime: parsedEventTime,
        Description,
        totalseat: Number(totalseat),
        Rules,
        location,
        questions: {
          create: questions.map((q) => ({
            question: q.question.trim(),
            isrequire: q.isrequire ?? false,
          })),
        },
      },
      
      select:{
        eventname:true,
        id:true,
        organizerid:true
      }
    });
   
    return res.status(201).json({
      msg: `Event and questions created${newEvent.eventname} successfully`,
      info:newEvent
      
    });
  } catch (error) {
    console.error("Event creation failed:", error);

    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

export { NewEventCreation };
