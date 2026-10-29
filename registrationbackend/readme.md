# EVENT MANAGMENT REGISTRATION FOR ORGANIZER AND AND REGISTER FROM MICRO SERVICE
HOW RUN THE SERVER
CD IN TO SRC FOLDER
RUN CMD NPM RUN DEV


FOLDER CONTAINS
CONTROLLER CONTIONAS ALL SERIVCES CODE
ROUTE FOLDER CONTAIN ROUTING PART
PRISMA CONFIG CONTAIN schema etc
index js contain all in one module 

DB USED NEON DB 
AND AS ENV IT IS IMPORTED AS DB_URL

NOW API 
# 1 ORGANIZER REGISTRATION 
YOU HAVE TO PROVIDE USER ID THROUGH BODY IN RESPONSE EXAMPLE GIVEN IN SAMPLE
THE API ENDPOINT IS 
http://localhost:8000/api/v1/neweventcreation
METHOD POST

RESPONSE EXAMPLE :
{
  "organizerid": "cmg123abc456xyz789",
  "eventname": "Tech Fest 2026",
  "eventDate": "2026-12-15T00:00:00.000Z",
  "eventTime": "1970-01-01T10:00:00.000Z",
  "Description": "A college technology festival featuring coding competitions, workshops, and AI demonstrations.",
  "totalseat": 100,
  "Rules": "Bring your college ID. Register only once. Follow the event organizers' instructions.",
  "location": "Meghnad Saha Institute of Technology, Kolkata",
  "questions": [
    {
      "question": "Which department are you from?",
      "isrequire": true
    },
    {
      "question": "What is your year of study?",
      "isrequire": true
    },
    {
      "question": "Why do you want to attend this event?",
      "isrequire": false
    }
  ]
}

# THE QUESTION WILL GENRATE EACH ID WHICH IS CUID() , AND EVENT ID WILL BE ALSO A CUID()


# NEW REGISTRATION FROM 
YOU HAVE TO PROVIDE EVENT ID , AND USER ID WHICH WILL BE SHARED VIA INPUT BODY, AND FOR EACH ANSWER PROVIDED QUESTION ID WHICH IS CUID() YOU HAVE TO PROVIDE which is also via body 

API ENDPOINT :
http://localhost:8000/api/v1/newregistration
METHOD POST

#NOTE THAT THE QUESTION ID SHOULD BE EXACT MATCH WHILE TAKING ANSWER INPUT OTHERWISE IT SHOWS ERRORR

RESPONSE WHICH BACKEND ACCEPT 
{
  "eventId": "cmvpngjpk0000nouhlrrlkh6w",
  "userid": "cmg123user456",
  "answers": [
    {
      "questionId": "cmvpngjx30001nouh18r48g2s",
      "answer": "Computer Science and Business Systems"
    },
    {
      "questionId": "cmvpngjx30002nouhw61ypu3x",
      "answer": "2nd Year"
    },
    {
      "questionId": "cmvpngjx30003nouhdze8rgpy",
      "answer": "I want to learn about AI and meet other developers."
    }
  ]
}


SERVER GIVE RESPONSE WHEN IT CREATED 
{
  "msg": "Registration completed successfully for event id cmvpngjpk0000nouhlrrlkh6w and user id cmg123user456",
  "info": {
    "id": "cmvq6gp7q0000y4uhk5efgf6x",
    "eventId": "cmvpngjpk0000nouhlrrlkh6w",
    "userid": "cmg123user456",
    "status": "CONFIRMED",
    "createdAt": "2026-10-27T04:20:39.975Z",
    "updatedAt": "2026-10-27T04:20:39.975Z",
    "Answers": [
      {
        "id": "cmvq6gpes0001y4uh61z4bkxg",
        "regid": "cmvq6gp7q0000y4uhk5efgf6x",
        "questionId": "cmvpngjx30001nouh18r48g2s",
        "answer": "Computer Science and Business Systems",
        "createdAt": "2026-10-27T04:20:39.975Z",
        "updatedAt": "2026-10-27T04:20:39.975Z"
      },
      {
        "id": "cmvq6gpet0002y4uhagogg7qj",
        "regid": "cmvq6gp7q0000y4uhk5efgf6x",
        "questionId": "cmvpngjx30002nouhw61ypu3x",
        "answer": "2nd Year",
        "createdAt": "2026-10-27T04:20:39.975Z",
        "updatedAt": "2026-10-27T04:20:39.975Z"
      },
      {
        "id": "cmvq6gpet0003y4uhh9p295si",
        "regid": "cmvq6gp7q0000y4uhk5efgf6x",
        "questionId": "cmvpngjx30003nouhdze8rgpy",
        "answer": "I want to learn about AI and meet other developers.",
        "createdAt": "2026-10-27T04:20:39.975Z",
        "updatedAt": "2026-10-27T04:20:39.975Z"
      }
    ]
  }
}


# for health check is the server running 
give a get request at api endpoint 
http://localhost:8000/api/v1/healthcheck
MEATHOD GET

# WHAT EACH SERIVCE DOING 
THE NEWEVENT SERVICE PRODUCING A NEW EVENT WITHE THE QUESTION 

THE REGISTRATION FROM  , THE REGISTRATION FROM IS COLLCETION ALL ASNWER FOR THE EVENT 

# STRICLY FOLLOW THE MODEL OR SCHEMA OTHER IT WILL BE NOT AT SYNC 
# FOR ANY QUERY CONTACT ME IN WHATSAPP