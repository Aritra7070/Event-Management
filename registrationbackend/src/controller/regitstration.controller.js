


import { prisma } from "../db/prismadb.js";


const NewRegistrationfrom = async (req, res) => {
  try {
    const { eventId, userid, answers } = req.body;

   
    if (!eventId) {
      return res.status(400).json({
        msg: "Event ID is required",
      });
    }
    if (!userid){
      return res.status(400).json({
        msg: "user ID is required",
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        msg: "Answers must be a non-empty array",
      });
    }

    
    const invalidAnswer = answers.some(
      (ans) =>
        !ans ||
        typeof ans.questionId !== "string" ||
        !ans.questionId.trim() ||
        typeof ans.answer !== "string"
    );

    if (invalidAnswer) {
      return res.status(400).json({
        msg: "Each answer needs a questionId and a string answer",
      });
    }

    // 3. Reject duplicate question IDs
    const questionIds = answers.map((ans) => ans.questionId);

    if (new Set(questionIds).size !== questionIds.length) {
      return res.status(400).json({
        msg: "Duplicate question IDs are not allowed",
      });
    }

   
    

    
    const event = await prisma.eventRegistration.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return res.status(404).json({
        msg: "Event does not exist",
      });
    }

    
    const matchingQuestions = await prisma.question.count({
      where: {
        foreventId: eventId,
        id: { in: questionIds },
      },
    });

    if (matchingQuestions !== questionIds.length) {
      return res.status(400).json({
        msg: "One or more questions do not belong to this event",
      });
    }

    
    const registration = await prisma.$transaction(async (tx) => {
      const seat = await tx.eventRegistration.updateMany({
        where: {
          id: eventId,
          totalseat: { gt: 0 },
        },
        data: {
          totalseat: { decrement: 1 },
        },
      });

      if (seat.count === 0) {
        throw new Error("EVENT_FULL")
      }

      const New_Registration= tx.registration.create({
        data: {
          eventId,
          userid,
          status: "CONFIRMED",
          Answers: {
            create: answers.map((ans) => ({
              questionId: ans.questionId,
              answer: ans.answer,
            })),
          },
        },
        include: {
          Answers: true,
         
        },
      });
      return New_Registration;
    });

    return res.status(201).json({
      msg: `Registration completed successfully for event id ${eventId} and user id ${userid}`,
      info: registration,
    });
  } catch (error) {
    console.error("Registration failed:", error);

    if (error.message === "EVENT_FULL") {
      return res.status(409).json({
        msg: "This event is full",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        msg: "You are already registered for this event",
      });
    }

    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};

export { NewRegistrationfrom };
